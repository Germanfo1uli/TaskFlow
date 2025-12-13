package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.CreateCommentRequest;
import com.example.issueservice.dto.response.CommentResponse;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.IssueCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/issues/{issueId}/comments")
@RequiredArgsConstructor
public class IssueCommentController {

    private final IssueCommentService commentService;

    @Operation(
            summary = "Создание комментария",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId) {

        log.info("Request to create comment for issue {}", issueId);

        // TODO: Взять ID автора из JWT-токена (контекста безопасности)
        Long authorId = 1L;

        CommentResponse createdComment = commentService.createComment(principal.userId(), issueId, request.message());
        log.info("Successfully created comment with id: {}", createdComment.id());
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
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