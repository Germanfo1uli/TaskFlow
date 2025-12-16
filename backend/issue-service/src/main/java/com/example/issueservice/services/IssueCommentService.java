package com.example.issueservice.services;

import com.example.issueservice.client.UserServiceClient;
import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.EntityType;
import com.example.issueservice.dto.rabbit.IssueAssigneeRemovedEvent;
import com.example.issueservice.dto.rabbit.IssueCommentCreatedEvent;
import com.example.issueservice.dto.rabbit.IssueCommentUpdatedEvent;
import com.example.issueservice.dto.response.CommentResponse;
import com.example.issueservice.dto.response.PublicProfileResponse;
import com.example.issueservice.dto.response.UserPermissionsResponse;
import com.example.issueservice.exception.AccessDeniedException;
import com.example.issueservice.exception.CommentNotFoundException;
import com.example.issueservice.exception.IssueNotFoundException;
import com.example.issueservice.dto.models.IssueComment;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.repositories.IssueCommentRepository;
import com.example.issueservice.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IssueCommentService {

    private final IssueCommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final AuthService authService;
    private final UserServiceClient userClient;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CommentResponse createComment(Long userId, Long issueId, String message) {

        Issue issue = issueRepository.findWithFieldsById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue with id " + issueId + " not found"));

        authService.hasPermission(userId, issue.getProjectId(), EntityType.COMMENT, ActionType.CREATE);

        log.info("Creating comment for issue {} by user {}", issueId, userId);

        PublicProfileResponse profile = userClient.getProfileById(userId);

        IssueComment newComment = IssueComment.builder()
                .issue(issue)
                .userId(userId)
                .text(message)
                .build();

        IssueComment savedComment = commentRepository.save(newComment);
        log.info("Successfully created comment with id: {}", savedComment.getId());

        eventPublisher.publishEvent(
                IssueCommentCreatedEvent.from(savedComment, issue.getProjectId())
        );

        return CommentResponse.from(savedComment, profile);
    }
    
    @Transactional
    public CommentResponse updateComment(Long userId, Long commentId, String message) {

        IssueComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment with id " + commentId + " not found"));

        authService.hasPermission(userId, comment.getIssue().getProjectId(), EntityType.COMMENT, ActionType.EDIT_OWN);

        comment.setText(message);
        commentRepository.save(comment);

        eventPublisher.publishEvent(
                IssueCommentUpdatedEvent.from(comment, comment.getIssue().getProjectId(), userId)
        );

        return CommentResponse.from(comment, null);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {

        IssueComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment with id " + commentId + " not found"));

        Long projectId = comment.getIssue().getProjectId();

        log.info("User {} attempting to delete comment {} in project {}", userId, commentId, projectId);

        boolean isCommentAuthor = comment.getUserId().equals(userId);

        if (!isCommentAuthor) {
            UserPermissionsResponse permissions = authService.getUserPermissions(userId, projectId);

            if (!permissions.isOwner()) {
                throw new AccessDeniedException(
                        String.format("User %d cannot delete comment %d: not author and not project owner",
                                userId, commentId)
                );
            }

            log.info("User {} is project owner, granting permission to delete comment {}", userId, commentId);
        } else {
            authService.hasPermission(userId, projectId, EntityType.COMMENT, ActionType.DELETE_OWN);
            log.info("User {} is author of comment {}, deletion permitted", userId, commentId);
        }

        eventPublisher.publishEvent(
                IssueCommentUpdatedEvent.from(comment, comment.getIssue().getProjectId(), userId)
        );

        commentRepository.delete(comment);
        log.info("Successfully deleted comment {}", commentId);
    }
}
