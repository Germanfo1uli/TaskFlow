package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Issue;

import java.time.Instant;

public record IssueTypeChangedEvent(
        long projectId,
        long issueId,
        long updaterId,
        String oldType,
        String newType,
        Instant changedAtUtc
) {
    public static IssueTypeChangedEvent from(Issue issue, long updaterId, String oldType) {
        return new IssueTypeChangedEvent(
                issue.getProjectId(),
                issue.getId(),
                updaterId,
                oldType,
                issue.getType().name(),
                Instant.now()
        );
    }
}