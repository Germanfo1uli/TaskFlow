package com.example.issueservice.services;

import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.EntityType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.issueservice.client.BoardServiceClient;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.AssignmentType;
import com.example.issueservice.dto.models.enums.IssueStatus;
import com.example.issueservice.exception.*;
import com.example.issueservice.repositories.IssueRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransitionService {
    private final IssueRepository issueRepository;
    private final AuthService authService;
    private final AssignHelper assignHelper;

    @Transactional
    public void transitionStatus(Long userId, Long issueId, AssignmentType type, IssueStatus targetStatus) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        // проверка прав: для reviewer/qa - специфичное право, для developer - базовый доступ
        ActionType requiredAction = (type == AssignmentType.ASSIGNEE)
                ? ActionType.VIEW
                : type.getActionType();

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, requiredAction);

        validateTransition(issue.getStatus(), targetStatus, type);
        assignHelper.validateUserAssignedToRole(issue, userId, type);

        log.info("Transitioning issue {} from {} to {} by user {} as {}",
                issueId, issue.getStatus().name(), targetStatus.name(), userId, type.name());

        issue.setStatus(targetStatus);
        issueRepository.save(issue);

        log.info("Successfully transitioned issue {} to status {}", issueId, targetStatus.name());
    }

    private void validateTransition(IssueStatus currentStatus, IssueStatus targetStatus, AssignmentType type) {
        if (currentStatus == targetStatus) {
            throw new IllegalArgumentException(
                    String.format("Cannot transition to the same status: %s", currentStatus.name())
            );
        }

        boolean isValid = switch (type) {
            case ASSIGNEE -> isDeveloperTransitionValid(currentStatus, targetStatus);
            case CODE_REVIEWER -> isCodeReviewerTransitionValid(currentStatus, targetStatus);
            case QA_ENGINEER -> isQaEngineerTransitionValid(currentStatus, targetStatus);
        };

        if (!isValid) {
            throw new InvalidStatusTransitionException(
                    String.format("Invalid transition from %s to %s for role %s",
                            currentStatus.name(), targetStatus.name(), type.name())
            );
        }
    }

    private boolean isDeveloperTransitionValid(IssueStatus current, IssueStatus target) {
        return current == IssueStatus.IN_PROGRESS && target == IssueStatus.CODE_REVIEW;
    }

    private boolean isCodeReviewerTransitionValid(IssueStatus current, IssueStatus target) {
        return (current == IssueStatus.CODE_REVIEW && target == IssueStatus.QA) ||
                (current == IssueStatus.CODE_REVIEW && target == IssueStatus.IN_PROGRESS);
    }

    private boolean isQaEngineerTransitionValid(IssueStatus current, IssueStatus target) {
        return (current == IssueStatus.QA && target == IssueStatus.STAGING) ||
                (current == IssueStatus.QA && target == IssueStatus.IN_PROGRESS);
    }
}