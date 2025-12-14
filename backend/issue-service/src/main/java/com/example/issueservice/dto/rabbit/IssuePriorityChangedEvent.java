package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Issue;

import java.time.Instant;

public record IssuePriorityChangedEvent(
        long projectId,
        long issueId,
        long updaterId,
        String oldPriority,
        String newPriority,
        Instant changedAtUtc
) {
    public static IssuePriorityChangedEvent from(Issue issue, long updaterId, String oldPriority) {
        return new IssuePriorityChangedEvent(
                issue.getProjectId(),
                issue.getId(),
                updaterId,
                oldPriority,
                issue.getPriority().name(),
                Instant.now()
        );
    }
}