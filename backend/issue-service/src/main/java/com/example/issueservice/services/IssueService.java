package com.example.issueservice.services;

import com.example.issueservice.client.BoardServiceClient;
import com.example.issueservice.client.UserServiceClient;
import com.example.issueservice.dto.data.IssueBatchRequest;
import com.example.issueservice.dto.data.UserBatchRequest;
import com.example.issueservice.dto.models.IssueComment;
import com.example.issueservice.dto.models.ProjectTag;
import com.example.issueservice.dto.models.enums.*;
import com.example.issueservice.dto.rabbit.*;
import com.example.issueservice.dto.response.*;
import com.example.issueservice.exception.*;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.repositories.IssueCommentRepository;
import com.example.issueservice.repositories.IssueRepository;
import com.example.issueservice.repositories.ProjectTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@Slf4j
@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectTagRepository tagRepository;
    private final IssueCommentRepository commentRepository;
    private final IssueHierarchyValidator hierarchyValidator;
    private final AuthService authService;
    private final UserServiceClient userClient;
    private final BoardServiceClient boardClient;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public IssueDetailResponse createIssue(
            Long userId, Long projectId, Long assigneeId, Long parentId, String title,
            String description, IssueType type, Priority priority, List<Long> tagIds) {

        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.CREATE);
        log.info("Creating new issue for project: {}", projectId);

        PublicProfileResponse assignee = null;

        if (assigneeId != null) {
            try {
                boardClient.getMember(assigneeId, projectId);
                assignee = userClient.getProfileById(assigneeId);
            } catch (Exception e) {
                throw new UserNotFoundException("User " + assigneeId + " is not a member of project " + projectId);
            }
        }

        Issue parentIssue = findAndValidateParentIssue(parentId, projectId);
        Issue newIssue = buildAndSaveBaseIssue(userId, projectId, assigneeId, parentIssue, title, description, type, priority);

        List<TagResponse> tags = (tagIds != null && !tagIds.isEmpty())
                ? assignTagsToIssue(newIssue, tagIds, projectId, true)
                : List.of();

        eventPublisher.publishEvent(
                IssueCreatedEvent.from(newIssue)
        );

        log.info("Successfully created issue with id: {}, level: {}", newIssue.getId(), newIssue.getLevel());
        return IssueDetailResponse.fromIssue(
                newIssue,
                tags,
                assignee
        );
    }

    @Transactional
    public IssueDetailResponse updateIssue(
            Long userId, Long issueId, String title, String description,
            Priority priority, List<Long> tagIds) {

        Issue issue = issueRepository.findWithFieldsById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with id " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, ActionType.EDIT);
        log.info("Updating issue with id: {}", issueId);

        if (title != null) {
            issue.setTitle(title);
        }
        if (description != null) {
            issue.setDescription(description);
        }
        if (priority != null) {
            issue.setPriority(priority);
        }

        if (tagIds != null) {
            assignTagsToIssue(issue, tagIds, issue.getProjectId(), false);
        }

        eventPublisher.publishEvent(
                IssueUpdatedEvent.from(issue, userId)
        );

        issueRepository.save(issue);
        log.info("Successfully updated issue with id: {}", issue.getId());

        return getIssueById(userId, issueId);
    }

    @Transactional
    public IssueDetailResponse assignTagsToIssue(Long userId, Long issueId, List<Long> tagIds) {

        Issue issue = issueRepository.findWithFieldsById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with id " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.TAG, ActionType.APPLY);

        if (issue.getAssigneeId() == null) {
            throw new AccessDeniedException("Issue has no assignee. Cannot modify tags.");
        }
        if (!issue.getAssigneeId().equals(userId)) {
            throw new AccessDeniedException("Only the assignee can modify issue tags");
        }

        log.info("Assigning tags {} to issue {} by user {}", tagIds, issueId, userId);

        assignTagsToIssue(issue, tagIds, issue.getProjectId(), false);

        eventPublisher.publishEvent(
                IssueUpdatedEvent.from(issue, userId)
        );

        issueRepository.save(issue);

        return getIssueById(userId, issueId);
    }

    private List<TagResponse> assignTagsToIssue(Issue issue, List<Long> tagIds, Long projectId, boolean saveAfter) {
        if (tagIds.isEmpty()) {
            issue.setTags(new HashSet<>());
            if (saveAfter) issueRepository.save(issue);
            return List.of();
        }

        Set<ProjectTag> foundTags = new HashSet<>(tagRepository.findAllById(tagIds));
        validateTagsForProject(foundTags, tagIds, projectId);

        issue.setTags(foundTags);
        if (saveAfter) issueRepository.save(issue);

        return foundTags.stream().map(TagResponse::from).toList();
    }

    private void validateTagsForProject(Set<ProjectTag> foundTags, List<Long> requestedTagIds, Long projectId) {

        if (foundTags.size() != requestedTagIds.size()) {
            throw new ProjectTagNotFoundException("One or more tags not found");
        }

        if (!foundTags.stream().allMatch(tag -> tag.getProjectId().equals(projectId))) {
            throw new ProjectTagNotFoundException("All tags must belong to project " + projectId);
        }
    }

    private Issue findAndValidateParentIssue(Long parentId, Long projectId) {
        if (parentId == null) {
            return null;
        }

        Issue parentIssue = issueRepository.findById(parentId)
                .orElseThrow(() -> new IssueNotFoundException(
                        "Parent issue with id " + parentId + " not found"));
        log.info("Found parent issue: {}", parentIssue.getTitle());

        if (!projectId.equals(parentIssue.getProjectId())) {
            throw new IssueNotInProjectException(
                    "Parent issue belongs to project " + parentIssue.getProjectId() + ", not to project " + projectId);
        }
        return parentIssue;
    }

    private Issue buildAndSaveBaseIssue(
            Long userId, Long projectId, Long assigneeId, Issue parentIssue,
            String title, String description, IssueType type, Priority priority) {

        Issue newIssue = Issue.builder()
                .projectId(projectId)
                .creatorId(userId)
                .assigneeId(assigneeId)
                .title(title)
                .description(description)
                .type(type)
                .priority(priority)
                .status(IssueStatus.TO_DO)
                .build();

        newIssue.setParentIssue(parentIssue);
        hierarchyValidator.validateHierarchy(newIssue, parentIssue);

        return issueRepository.save(newIssue);
    }

    @Transactional(readOnly = true)
    public IssueDetailResponse getIssueById(Long userId, Long issueId) {

        Issue issue = issueRepository.findWithFieldsById(issueId)
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

        Map<Long, PublicProfileResponse> userProfiles = getUserProfilesBatch(userIds);

        List<CommentResponse> comments = getCommentsForIssue(userId, issue.getProjectId(), issueId);

        List<TagResponse> tags = issue.getTags().stream()
                .map(TagResponse::from)
                .toList();

        List<AttachmentResponse> attachments = issue.getAttachments().stream()
                .map(AttachmentResponse::from)
                .toList();

        return IssueDetailResponse.withUsers(
                issue,
                userProfiles.get(issue.getCreatorId()),
                userProfiles.get(issue.getAssigneeId()),
                userProfiles.get(issue.getCodeReviewerId()),
                userProfiles.get(issue.getQaEngineerId()),
                tags,
                comments,
                attachments
        );
    }

    public InternalIssueResponse getIssueInternal(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with id " + issueId + " not found"));

        try {
            boardClient.getProjectById(issue.getProjectId());
        } catch (Exception e) {
            throw new ProjectNotFoundException(issue.getProjectId());
        }

        return InternalIssueResponse.from(issue);
    }

    public List<InternalIssueResponse> getIssuesByIds(List<Long> issuesIds) {

        if (issuesIds == null || issuesIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Issue> issues = issueRepository.findAllById(issuesIds);

        try {
            boardClient.getProjectById(issues.getFirst().getProjectId());
        } catch (Exception e) {
            throw new ProjectNotFoundException(issues.getFirst().getProjectId());
        }

        return issues.stream()
                .map(InternalIssueResponse::from)
                .collect(Collectors.toList());
    }

    public List<InternalIssueResponse> getIssuesInternal(Long projectId) {
        List<Issue> issues = issueRepository.findAllByProjectId(projectId);

        try {
            boardClient.getProjectById(projectId);
        } catch (Exception e) {
            throw new ProjectNotFoundException(projectId);
        }

        return issues.stream()
                .map(InternalIssueResponse::from)
                .collect(Collectors.toList());
    }

    private List<CommentResponse> getCommentsForIssue(Long userId, Long projectId, Long issueId) {
        try {
            authService.hasPermission(userId, projectId, EntityType.COMMENT, ActionType.VIEW);

            List<IssueComment> comments = commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId);

            if (comments.isEmpty()) {
                return Collections.emptyList();
            }

            Set<Long> commentUserIds = comments.stream()
                    .map(IssueComment::getUserId)
                    .collect(Collectors.toSet());

            Map<Long, PublicProfileResponse> profiles = getUserProfilesBatch(commentUserIds);

            return comments.stream()
                    .map(comment -> CommentResponse.from(comment, profiles.get(comment.getUserId())))
                    .collect(Collectors.toList());

        } catch (AccessDeniedException e) {
            log.warn("User {} does not have permission to view comments for issue {}", userId, issueId);
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<IssueDetailResponse> getIssuesByProject(Long userId, Long projectId) {

        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.VIEW);

        List<Issue> issues = issueRepository.findByProjectId(projectId);

        Set<Long> userIds = issues.stream()
                .flatMap(issue -> Stream.of(
                        issue.getCreatorId(),
                        issue.getAssigneeId(),
                        issue.getCodeReviewerId(),
                        issue.getQaEngineerId()
                ))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, PublicProfileResponse> userProfiles = getUserProfilesBatch(userIds);

        return issues.stream()
                .map(issue -> {
                    List<TagResponse> tags = issue.getTags().stream()
                            .map(TagResponse::from)
                            .toList();

                    PublicProfileResponse creator = userProfiles.get(issue.getCreatorId());
                    PublicProfileResponse assignee = userProfiles.get(issue.getAssigneeId());
                    PublicProfileResponse reviewer = userProfiles.get(issue.getCodeReviewerId());
                    PublicProfileResponse qa = userProfiles.get(issue.getQaEngineerId());

                    List<AttachmentResponse> attachments = issue.getAttachments().stream()
                            .map(AttachmentResponse::from)
                            .toList();

                    return IssueDetailResponse.withUsers(
                            issue,
                            creator,
                            assignee,
                            reviewer,
                            qa,
                            tags,
                            null,
                            attachments
                    );
                })
                .collect(Collectors.toList());
    }

    private Map<Long, PublicProfileResponse> getUserProfilesBatch(Set<Long> userIds) {

        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        log.info("Fetching users from UserService");

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

    @Transactional
    public void deleteIssue(Long userId, Long issueId) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with id " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.ISSUE, ActionType.DELETE);

        eventPublisher.publishEvent(
                IssueDeletedEvent.from(issue, userId)
        );

        issueRepository.deleteById(issueId);
    }

    @Transactional
    public List<InternalIssueResponse> startSprint(Long userId, Long projectId, IssueBatchRequest issuesIds) {
        log.info("Starting sprint for project {} with issues: {}", projectId, issuesIds);

        try {
            boardClient.getProjectById(projectId);
        } catch (Exception e) {
            throw new ProjectNotFoundException(projectId);
        }

        List<Long> issueIdsList = issuesIds.issuesIds();
        if (issueIdsList == null || issueIdsList.isEmpty()) {
            log.warn("No issues provided for sprint start in project {}", projectId);
            return Collections.emptyList();
        }

        List<Issue> issues = issueRepository.findAllById(issueIdsList);
        if (issues.size() != issueIdsList.size()) {
            throw new IssueNotFoundException("One or more issues not found for IDs: " + issueIdsList);
        }

        boolean allInProject = issues.stream().allMatch(issue -> issue.getProjectId().equals(projectId));
        if (!allInProject) {
            throw new IssueNotInProjectException("Some issues do not belong to project " + projectId);
        }

        for (Issue issue : issues) {
            if (issue.getStatus() == IssueStatus.TO_DO) {
                if (issue.getAssigneeId() == null) {
                    IssueStatus oldStatus = issue.getStatus();
                    issue.setStatus(IssueStatus.SELECTED_FOR_DEVELOPMENT);
                    eventPublisher.publishEvent(
                            IssueStatusChangedEvent.from(issue, userId, oldStatus.name())
                    );
                    log.info("Changed status of issue {} to SELECTED_FOR_DEVELOPMENT (no assignee)", issue.getId());
                } else {
                    IssueStatus oldStatus = issue.getStatus();
                    issue.setStatus(IssueStatus.IN_PROGRESS);
                    eventPublisher.publishEvent(
                            IssueStatusChangedEvent.from(issue, userId, oldStatus.name())
                    );
                    log.info("Changed status of issue {} to IN_PROGRESS (has assignee {})", issue.getId(), issue.getAssigneeId());
                }
            } else {
                log.warn("Issue {} is not in TO_DO status (current: {}), skipping status change", issue.getId(), issue.getStatus());
            }
        }

        issueRepository.saveAll(issues);

        return issues.stream()
                .map(InternalIssueResponse::from)
                .collect(Collectors.toList());
    }
}