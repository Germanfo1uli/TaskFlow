package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Issue;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public record IssueCreatedEvent(
        long projectId,
        long issueId,
        long creatorId,
        Instant createdAtUtc
) {
    public static IssueCreatedEvent from(Issue issue) {
        LocalDateTime issueCreatedAt = issue.getCreatedAt();
        Instant createdAtInstant = (issueCreatedAt != null)
                ? issueCreatedAt.atZone(ZoneId.of("UTC")).toInstant()
                : Instant.now();

        return new IssueCreatedEvent(
                issue.getProjectId(),
                issue.getId(),
                issue.getCreatorId(),
                createdAtInstant
        );
    }
}