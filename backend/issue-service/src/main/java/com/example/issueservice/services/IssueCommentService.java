package com.example.issueservice.services;

import com.example.issueservice.client.UserServiceClient;
import com.example.issueservice.dto.data.UserBatchRequest;
import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.EntityType;
import com.example.issueservice.dto.response.CommentResponse;
import com.example.issueservice.dto.response.PublicProfileResponse;
import com.example.issueservice.exception.CommentNotFoundException;
import com.example.issueservice.exception.IssueNotFoundException;
import com.example.issueservice.dto.models.IssueComment;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.repositories.IssueCommentRepository;
import com.example.issueservice.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IssueCommentService {

    private final IssueCommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final AuthService authService;
    private final UserServiceClient userClient;

    @Transactional
    public CommentResponse createComment(Long userId, Long issueId, String message) {

        Issue issue = issueRepository.findWithTagsById(issueId)
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

        // FUTURE: Публикация события в RabbitMQ для уведомлений
        // rabbitTemplate.convertAndSend("jira.events", "issue.comment.added", new CommentAddedEvent(issueId, savedComment.getId(), authorId));

        return CommentResponse.from(savedComment, profile);
    }

    @Transactional
    public void deleteComment(Long commentId, Long requestingUserId) {
        log.info("User {} is trying to delete comment {}", requestingUserId, commentId);
        IssueComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment with id " + commentId + " not found"));

        // TODO: Добавить проверку прав. Удалять может только автор или администратор проекта.
        // if (!comment.getUserId().equals(requestingUserId) && !isProjectAdmin(requestingUserId, comment.getIssue().getProjectId())) {
        //     throw new AccessDeniedException("You do not have permission to delete this comment");
        // }

        commentRepository.delete(comment);
        log.info("Successfully deleted comment {}", commentId);
        // FUTURE: Публикация события 'issue.comment.deleted'
    }
}
