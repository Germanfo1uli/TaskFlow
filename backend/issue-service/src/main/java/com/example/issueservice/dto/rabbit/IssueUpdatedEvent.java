package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Issue;

import java.time.Instant;

public record IssueUpdatedEvent(
        long projectId,
        long issueId,
        long updaterId,
        Instant updatedAtUtc
) {
    public static IssueUpdatedEvent from(Issue issue, long updaterId) {
        return new IssueUpdatedEvent(
                issue.getProjectId(),
                issue.getId(),
                updaterId,
                Instant.now()
        );
    }
}