package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Issue;

import java.time.Instant;

public record IssueStatusChangedEvent(
        long projectId,
        long issueId,
        long updaterId,
        String oldStatus,
        String newStatus,
        Instant changedAtUtc
) {
    public static IssueStatusChangedEvent from(Issue issue, long updaterId, String oldStatus) {
        return new IssueStatusChangedEvent(
                issue.getProjectId(),
                issue.getId(),
                updaterId,
                oldStatus,
                issue.getStatus().name(),
                Instant.now()
        );
    }
}