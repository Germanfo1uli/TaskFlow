package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Issue;

import java.time.Instant;

public record IssueAssigneeAddedEvent(
        long projectId,
        long issueId,
        long assignedUserId,
        long assignerId,
        Instant assignedAtUtc
) {
    public static IssueAssigneeAddedEvent from(Issue issue, long assignedUserId, long assignerId) {
        return new IssueAssigneeAddedEvent(
                issue.getProjectId(),
                issue.getId(),
                assignedUserId,
                assignerId,
                Instant.now()
        );
    }
}
