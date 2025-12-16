package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.IssueComment;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public record IssueCommentCreatedEvent(
        long projectId,
        long issueId,
        long commentId,
        long authorId,
        Instant createdAtUtc
) {
    public static IssueCommentCreatedEvent from(IssueComment comment, long projectId) {
        LocalDateTime commentCreatedAt = comment.getCreatedAt();
        Instant createdAtInstant = (commentCreatedAt != null)
                ? commentCreatedAt.atZone(ZoneId.of("UTC")).toInstant()
                : Instant.now();

        return new IssueCommentCreatedEvent(
                projectId,
                comment.getIssue().getId(),
                comment.getId(),
                comment.getUserId(),
                createdAtInstant
        );
    }
}