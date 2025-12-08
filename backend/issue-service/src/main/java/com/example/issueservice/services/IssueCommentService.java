package com.example.issueservice.services;

import com.example.issueservice.dto.response.CommentDto;
import com.example.issueservice.dto.request.CreateCommentDto;
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
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IssueCommentService {

    private final IssueCommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final RestTemplate restTemplate;

    @Transactional
    public CommentDto createComment(Long issueId, CreateCommentDto dto, Long authorId) {
        log.info("Creating comment for issue {} by user {}", issueId, authorId);

        if (!issueRepository.existsById(issueId)) {
            throw new IssueNotFoundException("Issue with id " + issueId + " not found");
        }

        IssueComment newComment = IssueComment.builder()
                .issue(Issue.builder().id(issueId).build())
                .userId(authorId) // TODO: Взять ID из контекста безопасности (JWT)
                .text(dto.getText())
                .build();

        IssueComment savedComment = commentRepository.save(newComment);
        log.info("Successfully created comment with id: {}", savedComment.getId());

        // FUTURE: Публикация события в RabbitMQ для уведомлений
        // rabbitTemplate.convertAndSend("jira.events", "issue.comment.added", new CommentAddedEvent(issueId, savedComment.getId(), authorId));

        return convertToDto(savedComment);
    }

    public List<CommentDto> getCommentsByIssueId(Long issueId) {
        log.info("Fetching comments for issue: {}", issueId);
        List<IssueComment> comments = commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
        return comments.stream()
                .map(this::enrichCommentWithAuthorName)
                .collect(Collectors.toList());
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

    private CommentDto convertToDto(IssueComment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private CommentDto enrichCommentWithAuthorName(IssueComment comment) {
        // FUTURE: Здесь будет вызов к user-service для получения displayName
        // String userUrl = "http://user-service/api/users/" + comment.getUserId();
        // UserDto user = restTemplate.getForObject(userUrl, UserDto.class);
        // String authorName = user.getDisplayName();

        String authorName = "User " + comment.getUserId(); // Заглушка

        return CommentDto.builder()
                .id(comment.getId())
                .text(comment.getText())
                .authorName(authorName)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
