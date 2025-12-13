package com.example.issueservice.services;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.*;
import com.example.issueservice.exception.*;
import com.example.issueservice.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransitionService {
    private final IssueRepository issueRepository;
    private final AuthService authService;
    private final AssignHelper assignHelper;

    @Transactional
    public void transitionAsOwner(Long userId, Long issueId, IssueStatus targetStatus) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, ActionType.FULL_TRANSITION);

        log.info("Owner transitioning issue {} from {} to {} by user {}",
                issueId, issue.getStatus().name(), targetStatus.name(), userId);

        issue.setStatus(targetStatus);
        issueRepository.save(issue);

        log.info("Successfully transitioned issue {} to status {} by owner", issueId, targetStatus.name());
    }

    @Transactional
    public void transitionAsRole(Long userId, Long issueId, AssignmentType assignmentType, IssueStatus targetStatus) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        ActionType requiredAction = (assignmentType == AssignmentType.ASSIGNEE)
                ? ActionType.VIEW
                : assignmentType.getActionType();

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, requiredAction);

        validateTransition(issue.getStatus(), targetStatus, assignmentType);

        assignHelper.validateUserAssignedToRole(issue, userId, assignmentType);

        log.info("Role transitioning issue {} from {} to {} by user {} as {}",
                issueId, issue.getStatus().name(), targetStatus.name(), userId, assignmentType.name());

        issue.setStatus(targetStatus);
        issueRepository.save(issue);

        log.info("Successfully transitioned issue {} to status {}", issueId, targetStatus.name());
    }

    private void validateTransition(IssueStatus currentStatus, IssueStatus targetStatus, AssignmentType type) {
        if (currentStatus == targetStatus) {
            throw new InvalidStatusTransitionException("Cannot transition to the same status: " + currentStatus.name());
        }

        boolean isValid = switch (type) {
            case ASSIGNEE -> isDeveloperTransitionValid(currentStatus, targetStatus);
            case CODE_REVIEWER -> isCodeReviewerTransitionValid(currentStatus, targetStatus);
            case QA_ENGINEER -> isQaEngineerTransitionValid(currentStatus, targetStatus);
        };

        if (!isValid) {
            throw new InvalidStatusTransitionException(
                    "Invalid transition from " + currentStatus.name() + " to " + targetStatus.name() + " for role " + type.name());
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