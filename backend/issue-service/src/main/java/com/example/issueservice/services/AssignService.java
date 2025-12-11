package com.example.issueservice.services;

import com.example.issueservice.client.BoardServiceClient;
import com.example.issueservice.client.UserServiceClient;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.AssignmentType;
import com.example.issueservice.dto.models.enums.EntityType;
import com.example.issueservice.exception.AccessDeniedException;
import com.example.issueservice.exception.IssueNotFoundException;
import com.example.issueservice.exception.RoleAlreadyAssignedException;
import com.example.issueservice.exception.UserNotFoundException;
import com.example.issueservice.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignService {

    private final IssueRepository issueRepository;
    private final AuthService authService;
    private final BoardServiceClient boardClient;

    @Transactional
    public void assignUserTo(Long userId, Long issueId, Long assigneeId, AssignmentType type) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, ActionType.ASSIGN);

        log.info("Adding user {} to assignee of issue {}", assigneeId, issueId);

        try {
            boardClient.getMember(assigneeId, issue.getProjectId());
        } catch (Exception e) {
            throw new UserNotFoundException("User with ID: " + assigneeId + " does not exist in project " + issue.getProjectId());
        }

        switch (type) {
            case ASSIGNEE -> issue.setAssigneeId(assigneeId);
            case CODE_REVIEWER -> issue.setCodeReviewerId(assigneeId);
            case QA_ENGINEER -> issue.setQaEngineerId(assigneeId);
            default -> throw new IllegalArgumentException("Invalid assignment type");
        }

        issueRepository.save(issue);
        log.info("Successfully added assignee.");
    }

    @Transactional
    public void assignSelf(Long userId, Long issueId, AssignmentType type) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, type.getActionType());

        validateRoleAvailability(issue, userId, type);

        log.info("Adding user self {} to assignee of issue {}", userId, issueId);

        switch (type) {
            case ASSIGNEE -> issue.setAssigneeId(userId);
            case CODE_REVIEWER -> issue.setCodeReviewerId(userId);
            case QA_ENGINEER -> issue.setQaEngineerId(userId);
            default -> throw new IllegalArgumentException("Invalid assignment type");
        }

        issueRepository.save(issue);
        log.info("Successfully added self assignee.");
    }

    private void validateRoleAvailability(Issue issue, Long userId, AssignmentType type) {
        Long currentAssignee = switch (type) {
            case ASSIGNEE -> issue.getAssigneeId();
            case CODE_REVIEWER -> issue.getCodeReviewerId();
            case QA_ENGINEER -> issue.getQaEngineerId();
        };

        if (currentAssignee != null && !currentAssignee.equals(userId)) {
            throw new RoleAlreadyAssignedException(
                    String.format("Role %s is already assigned to user %d", type, currentAssignee)
            );
        }
    }

    @Transactional
    public void removeAssignee(Long userId, Long issueId, AssignmentType type) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, ActionType.ASSIGN);

        log.info("Removing from assignees of issue {}", issueId);

        switch (type) {
            case ASSIGNEE -> issue.setAssigneeId(null);
            case CODE_REVIEWER -> issue.setCodeReviewerId(null);
            case QA_ENGINEER -> issue.setQaEngineerId(null);
            default -> throw new IllegalArgumentException("Invalid assignment type");
        }

        issueRepository.save(issue);
        log.info("Successfully removed assignee.");
    }

    @Transactional
    public void removeSelfAssign(Long userId, Long issueId, AssignmentType type) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, type.getActionType());

        Long currentAssigneeInRole = switch (type) {
            case ASSIGNEE -> issue.getAssigneeId();
            case CODE_REVIEWER -> issue.getCodeReviewerId();
            case QA_ENGINEER -> issue.getQaEngineerId();
        };

        if(!Objects.equals(userId, currentAssigneeInRole)) {
            throw new AccessDeniedException("You are not assigned for issue ID " + issueId);
        }

        log.info("Removing self from issue {}", issueId);

        switch (type) {
            case ASSIGNEE -> issue.setAssigneeId(null);
            case CODE_REVIEWER -> issue.setCodeReviewerId(null);
            case QA_ENGINEER -> issue.setQaEngineerId(null);
            default -> throw new IllegalArgumentException("Invalid assignment type");
        }

        issueRepository.save(issue);
        log.info("Successfully removed self assignee.");
    }
}
