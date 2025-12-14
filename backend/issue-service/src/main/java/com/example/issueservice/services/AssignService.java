package com.example.issueservice.services;

import com.example.issueservice.client.BoardServiceClient;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.AssignmentType;
import com.example.issueservice.dto.models.enums.EntityType;
import com.example.issueservice.dto.models.enums.IssueStatus;
import com.example.issueservice.exception.IssueNotFoundException;
import com.example.issueservice.exception.UserNotFoundException;
import com.example.issueservice.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignService {

    private final IssueRepository issueRepository;
    private final AuthService authService;
    private final BoardServiceClient boardClient;
    private final AssignHelper assignHelper;

    @Transactional
    public void assignUserTo(Long userId, Long issueId, Long assigneeId, AssignmentType type) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, ActionType.ASSIGN);
        log.info("Assigning user {} as {} to issue {} by {}", assigneeId, type.name(), issueId, userId);

        validateUserInProject(assigneeId, issue.getProjectId());

        assignHelper.validateRoleAvailable(issue, assigneeId, type);
        assignHelper.setAssignee(issue, type, assigneeId);
        issueRepository.save(issue);

        log.info("Successfully assigned user {} as {} to issue {}", assigneeId, type.name(), issueId);
    }

    @Transactional
    public void assignSelf(Long userId, Long issueId, AssignmentType type) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, type.getActionType());

        log.info("Self-assigning user {} as {} to issue {}", userId, type.name(), issueId);

        assignHelper.validateRoleAvailable(issue, userId, type);
        assignHelper.setAssignee(issue, type, userId);

        if (type == AssignmentType.ASSIGNEE && issue.getStatus() == IssueStatus.SELECTED_FOR_DEVELOPMENT) {
            issue.setStatus(IssueStatus.IN_PROGRESS);
            log.info("Changed status of issue {} from SELECTED_FOR_DEVELOPMENT to IN_PROGRESS due to self-assignment", issueId);
        }

        issueRepository.save(issue);

        log.info("Successfully self-assigned user {} as {} to issue {}", userId, type.name(), issueId);
    }

    @Transactional
    public void removeAssignee(Long userId, Long issueId, AssignmentType type) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, ActionType.ASSIGN);

        log.info("Removing assignee from {} of issue {} by {}", type.name(), issueId, userId);

        assignHelper.setAssignee(issue, type, null);
        issueRepository.save(issue);

        log.info("Successfully removed assignee from {} of issue {}", type.name(), issueId);
    }

    @Transactional
    public void removeSelfAssign(Long userId, Long issueId, AssignmentType type) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with ID: " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, type.getActionType());
        log.info("Removing self-assign from {} of issue {} by {}", type.name(), issueId, userId);

        assignHelper.validateUserAssignedToRole(issue, userId, type);
        assignHelper.setAssignee(issue, type, null);
        issueRepository.save(issue);

        log.info("Successfully removed self from {} of issue {}", type.name(), issueId);
    }

    private void validateUserInProject(Long userId, Long projectId) {
        try {
            boardClient.getMember(userId, projectId);
        } catch (Exception e) {
            throw new UserNotFoundException("User " + userId + " is not a member of project " + projectId);
        }
    }
}
