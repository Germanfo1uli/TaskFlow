package com.example.issueservice.controllers;

import com.example.issueservice.dto.response.CommentDto;
import com.example.issueservice.dto.request.CreateCommentDto;
import com.example.issueservice.services.IssueCommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/issues/{issueId}/comments")
@RequiredArgsConstructor
public class IssueCommentController {

    private final IssueCommentService commentService;

     // Создать новый комментарий к задаче.
    @PostMapping
    public ResponseEntity<CommentDto> createComment(
            @PathVariable Long issueId,
            @Valid @RequestBody CreateCommentDto dto) {
        log.info("Request to create comment for issue {}", issueId);

        // TODO: Взять ID автора из JWT-токена (контекста безопасности)
        Long authorId = 1L;

        CommentDto createdComment = commentService.createComment(issueId, dto, authorId);
        log.info("Successfully created comment with id: {}", createdComment.getId());
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    //Получить все комментарии для конкретной задачи.
    @GetMapping
    public ResponseEntity<List<CommentDto>> getCommentsByIssue(@PathVariable Long issueId) {
        log.info("Request to get all comments for issue: {}", issueId);
        List<CommentDto> comments = commentService.getCommentsByIssueId(issueId);
        return ResponseEntity.ok(comments);
    }

    // Удалить комментарий
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        log.info("Request to delete comment with id: {}", commentId);

        // TODO: Взять ID пользователя, который пытается удалить, из JWT-токена
        Long requestingUserId = 1L;

        commentService.deleteComment(commentId, requestingUserId);
        log.info("Successfully deleted comment {}", commentId);
        return ResponseEntity.noContent().build();
    }
}