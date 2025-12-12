package com.example.issueservice.services;

import com.example.issueservice.client.UserServiceClient;
import com.example.issueservice.dto.data.UserBatchRequest;
import com.example.issueservice.dto.models.enums.*;
import com.example.issueservice.dto.response.IssueDetailResponse;
import com.example.issueservice.dto.response.PublicProfileResponse;
import com.example.issueservice.exception.IssueNotFoundException;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.exception.IssueNotInProjectException;
import com.example.issueservice.exception.ServiceUnavailableException;
import com.example.issueservice.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@Slf4j
@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueHierarchyValidator hierarchyValidator;
    private final AuthService authService;
    private final UserServiceClient userClient;

    @Transactional
    public IssueDetailResponse createIssue(
            Long userId, Long projectId, Long parentId, String title,
            String description, IssueType type, Priority priority) {

        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.CREATE);

        log.info("Creating new issue for project: {}", projectId);

        Issue parentIssue = null;
        if (parentId != null) {
            parentIssue = issueRepository.findById(parentId)
                    .orElseThrow(() -> new IssueNotFoundException(
                            "Parent issue with id " + parentId + " not found"));
            log.info("Found parent issue: {}", parentIssue.getTitle());

            if (!projectId.equals(parentIssue.getProjectId())) {
                throw new IssueNotInProjectException(
                        "Parent issue with id " + parentId + " belongs to project " + parentIssue.getProjectId() + ", not to project " + projectId);
            }
        }

        Issue newIssue = Issue.builder()
                .projectId(projectId)
                .creatorId(userId)
                .title(title)
                .description(description)
                .type(type)
                .priority(priority)
                .status(IssueStatus.TO_DO)
                .build();

        newIssue.setParentIssue(parentIssue);
        hierarchyValidator.validateHierarchy(newIssue, parentIssue);

        Issue savedIssue = issueRepository.save(newIssue);
        log.info("Successfully created issue with id: {}, level: {}",
                savedIssue.getId(), savedIssue.getLevel());

        return IssueDetailResponse.fromIssue(savedIssue);
    }

    @Transactional(readOnly = true)
    public IssueDetailResponse getIssueById(Long userId, Long issueId) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with id " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, ActionType.VIEW);

        Set<Long> userIds = Stream.of(
                        issue.getCreatorId(),
                        issue.getAssigneeId(),
                        issue.getCodeReviewerId(),
                        issue.getQaEngineerId()
                )
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        var userProfiles = getUserProfilesBatch(userIds);

        return IssueDetailResponse.withUsers(
                issue,
                userProfiles.get(issue.getCreatorId()),
                userProfiles.get(issue.getAssigneeId()),
                userProfiles.get(issue.getCodeReviewerId()),
                userProfiles.get(issue.getQaEngineerId())
        );
    }

    @Transactional(readOnly = true)
    public List<IssueDetailResponse> getIssuesByProject(Long userId, Long projectId) {

        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.VIEW);

        List<Issue> issues = issueRepository.findByProjectId(projectId);

        Set<Long> assigneeIds = issues.stream()
                .map(Issue::getAssigneeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, PublicProfileResponse> assigneeProfiles = getUserProfilesBatch(assigneeIds);

        return issues.stream()
                .map(issue -> IssueDetailResponse.withAssignee(
                        issue,
                        assigneeProfiles.get(issue.getAssigneeId())
                ))
                .collect(Collectors.toList());
    }

    private Map<Long, PublicProfileResponse> getUserProfilesBatch(Set<Long> userIds) {

        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        log.info("Cache miss for user profiles: {}. Fetching from UserService...", userIds);

        try {
            UserBatchRequest request = new UserBatchRequest(new ArrayList<>(userIds));
            List<PublicProfileResponse> profiles = userClient.getProfilesByIds(request);

            return profiles.stream()
                    .collect(Collectors.toMap(PublicProfileResponse::id, p -> p));
        } catch (Exception e) {
            log.error("Failed to fetch profiles for users: {}", userIds, e);
            throw new ServiceUnavailableException("Failed to fetch user profiles: " + e.getMessage());
        }
    }
}


