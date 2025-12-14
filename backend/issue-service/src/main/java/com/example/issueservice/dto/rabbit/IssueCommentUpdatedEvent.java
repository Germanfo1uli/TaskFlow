package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.IssueComment;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public record IssueCommentUpdatedEvent(
        long projectId,
        long issueId,
        long commentId,
        long editorId,
        Instant updatedAtUtc
) {
    public static IssueCommentUpdatedEvent from(IssueComment comment, long projectId, long editorId) {
        LocalDateTime commentUpdatedAt = comment.getUpdatedAt();
        Instant updatedAtInstant = (commentUpdatedAt != null)
                ? commentUpdatedAt.atZone(ZoneId.of("UTC")).toInstant()
                : Instant.now();

        return new IssueCommentUpdatedEvent(
                projectId,
                comment.getIssue().getId(),
                comment.getId(),
                editorId,
                updatedAtInstant
        );
    }
}