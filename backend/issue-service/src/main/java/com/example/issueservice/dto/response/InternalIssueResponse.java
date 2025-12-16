package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.IssueStatus;
import com.example.issueservice.dto.models.enums.IssueType;
import com.example.issueservice.dto.models.enums.Priority;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDateTime;

@Schema(description = "Информация о задаче для других микросервисов")
public record InternalIssueResponse(
        Long id,

        Long assigneeId,

        String title,

        IssueStatus status,

        IssueType type,

        Priority priority,

        Instant completedAt
) {
        public static InternalIssueResponse from(Issue issue) {

                Instant completedAt = issue.getCompletedAt() != null
                        ? issue.getCompletedAt().atZone(java.time.ZoneOffset.UTC).toInstant()
                        : null;

                return new InternalIssueResponse(
                        issue.getId(),
                        issue.getAssigneeId(),
                        issue.getTitle(),
                        issue.getStatus(),
                        issue.getType(),
                        issue.getPriority(),
                        completedAt
                );
        }
}
