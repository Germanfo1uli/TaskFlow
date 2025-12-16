package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Issue;

import java.time.Instant;

public record IssueAssigneeRemovedEvent(
        long projectId,
        long issueId,
        long removedUserId,
        long removerId,
        Instant removedAtUtc
) {
    public static IssueAssigneeRemovedEvent from(Issue issue, long removedUserId, long removerId) {
        return new IssueAssigneeRemovedEvent(
                issue.getProjectId(),
                issue.getId(),
                removedUserId,
                removerId,
                Instant.now()
        );
    }
}