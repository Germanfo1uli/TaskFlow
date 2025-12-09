package com.example.issueservice.services;

import com.example.issueservice.client.BoardServiceClient;
import com.example.issueservice.client.UserServiceClient;
import com.example.issueservice.dto.data.UserBatchRequest;
import com.example.issueservice.dto.models.enums.*;
import com.example.issueservice.dto.response.CreateIssueResponse;
import com.example.issueservice.dto.response.IssueDetailResponse;
import com.example.issueservice.dto.response.PublicProfileResponse;
import com.example.issueservice.exception.IssueNotFoundException;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.AccessDeniedException;
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
    private final UserCacheService userCacheService;

    @Transactional
    public IssueDetailResponse createIssue(
            Long userId, Long projectId, Long parentId, String title, String description,
            IssueType type, Priority priority, LocalDateTime deadline) {

        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.CREATE);

        log.info("Creating new issue for project: {}", projectId);

        Issue parentIssue = null;
        if (parentId != null) {
            parentIssue = issueRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Parent issue with id " + parentId + " not found"));
            log.info("Found parent issue: {}", parentIssue.getTitle());
        }

        Issue newIssue = Issue.builder()
                .creatorId(userId)
                .title(title)
                .description(description)
                .type(type)
                .priority(priority)
                .deadline(deadline)
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
    public IssueDetailResponse getIssueById(Long userId, Long projectId, Long issueId) {
        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.VIEW);

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with id " + issueId + " not found"));

        if (!issue.getProjectId().equals(projectId)) {
            throw new IssueNotFoundException("Issue not found in project " + projectId);
        }

        Set<Long> userIds = Stream.of(
                        issue.getCreatorId(),
                        issue.getAssigneeId(),
                        issue.getCodeReviewerId(),
                        issue.getQaEngineerId()
                )
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        var userProfiles = userCacheService.getUserProfilesBatch(userIds);

        return IssueDetailResponse.withUsers(
                issue,
                userProfiles.get(issue.getCreatorId()),
                userProfiles.get(issue.getAssigneeId()),
                userProfiles.get(issue.getCodeReviewerId()),
                userProfiles.get(issue.getQaEngineerId())
        );
    }

    public List<CreateIssueResponse> getIssuesByProject(Long projectId) {
        log.info("Fetching all issues for project: {}", projectId);
        List<Issue> issues = issueRepository.findByProjectId(projectId);
        return issues.stream()
                .map(this::enrichIssueWithDetails)
                .collect(Collectors.toList());
    }

    public List<IssueDetailResponse> getIssueSummariesByProject(Long projectId) {
        log.info("Fetching all issue SUMMARIES for project: {}", projectId);
        List<Issue> issues = issueRepository.findByProjectId(projectId);

        return issues.stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }
    @Transactional
    public void addAssignee(Long issueId, Long userId) {
        log.info("Adding user {} as assignee to issue {}", userId, issueId);
        if (issueAssigneeRepository.existsByIssueIdAndUserId(issueId, userId)) {
            log.warn("User {} is already an assignee for issue {}", userId, issueId);
            return;
        }
        IssueAssignee newAssignee = IssueAssignee.builder()
                .issue(Issue.builder().id(issueId).build())
                .userId(userId)
                .build();
        issueAssigneeRepository.save(newAssignee);
        log.info("Successfully added assignee.");
    }

    @Transactional
    public void removeAssignee(Long issueId, Long userId) {
        log.info("Removing user {} from assignees of issue {}", userId, issueId);
        issueAssigneeRepository.deleteByIssueIdAndUserId(issueId, userId);
        log.info("Successfully removed assignee.");
    }

    @Cacheable(value = "user-profiles-batch", key = "#userIds.toString()")
    public Map<Long, PublicProfileResponse> getUserProfilesBatch(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Set<Long> validUserIds = userIds.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (validUserIds.isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            UserBatchRequest request = new UserBatchRequest(new ArrayList<>(validUserIds));
            List<PublicProfileResponse> profiles = userClient.getProfilesByIds(request);

            return profiles.stream()
                    .collect(Collectors.toMap(PublicProfileResponse::id, p -> p));
        } catch (Exception e) {
            log.error("Failed to fetch profiles for users: {}", validUserIds, e);
            return Collections.emptyMap();
        }
    }

    private IssueDetailResponse convertToSummaryDto(Issue issue) {
        return IssueDetailResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .status(issue.getStatus())
                .type(issue.getType())
                .priority(issue.getPriority())
                .deadline(issue.getDeadline())
                .createdAt(issue.getCreatedAt())
                // TODO: Когда будет RabbitMQ, здесь можно будет добавлять projectName, creatorName и т.д.
                .build();
    }
}


