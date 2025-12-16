package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Issue;

import java.time.Instant;

public record IssueDeletedEvent(
        long projectId,
        long issueId,
        long deleterId,
        Instant deletedAtUtc
) {
    public static IssueDeletedEvent from(Issue issue, long deleterId) {
        return new IssueDeletedEvent(
                issue.getProjectId(),
                issue.getId(),
                deleterId,
                Instant.now()
        );
    }
}