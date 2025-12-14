package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.IssueComment;

import java.time.Instant;

public record IssueCommentDeletedEvent(
        long projectId,
        long issueId,
        long commentId,
        long deleterId,
        Instant deletedAtUtc
) {
    public static IssueCommentDeletedEvent from(IssueComment comment, long projectId, long deleterId) {
        return new IssueCommentDeletedEvent(
                projectId,
                comment.getIssue().getId(),
                comment.getId(),
                deleterId,
                Instant.now()
        );
    }
}