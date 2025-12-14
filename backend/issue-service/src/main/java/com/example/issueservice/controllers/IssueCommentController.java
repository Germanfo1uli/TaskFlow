package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.CreateUpdateCommentRequest;
import com.example.issueservice.dto.response.CommentResponse;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.IssueCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/issues/{issueId}/comments")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Comment Management", description = "Управление комментариями")
public class IssueCommentController {

    private final IssueCommentService commentService;

    @Operation(
            summary = "Создание комментария",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CreateUpdateCommentRequest request,
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId) {

        log.info("Request to create comment for issue {}", issueId);

        CommentResponse response = commentService.createComment(principal.userId(), issueId, request.message());
        log.info("Successfully created comment with id: {}", response.id());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Изменение комментария",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @Valid @RequestBody CreateUpdateCommentRequest request,
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long commentId,
            @PathVariable String issueId) {

        log.info("Request to update comment with id: {}", commentId);

        CommentResponse response = commentService.updateComment(principal.userId(), commentId, request.message());
        log.info("Successfully update comment {}", commentId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Удаление комментария (Автором или Owner'ом)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long commentId,
            @PathVariable String issueId) {

        log.info("Request to delete comment with id: {}", commentId);

        commentService.deleteComment(principal.userId(), commentId);
        log.info("Successfully deleted comment {}", commentId);
        return ResponseEntity.noContent().build();
    }
}