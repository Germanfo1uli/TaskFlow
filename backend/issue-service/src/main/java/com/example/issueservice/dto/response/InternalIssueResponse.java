package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.IssueStatus;
import com.example.issueservice.dto.models.enums.IssueType;
import com.example.issueservice.dto.models.enums.Priority;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Информация о задаче для других микросервисов")
public record InternalIssueResponse(
        @Schema(description = "ID задачи", example = "123")
        Long id,

        @Schema(description = "ID ответственного", example = "123")
        Long assigneeId,

        @Schema(description = "ID ответственного", example = "123")
        String title,

        @Schema(description = "ID ответственного", example = "123")
        IssueStatus status,

        @Schema(description = "ID ответственного", example = "123")
        IssueType type,

        @Schema(description = "ID ответственного", example = "123")
        Priority priority,

        @Schema(description = "ID ответственного", example = "123")
        LocalDateTime completedAt
) {
        public static InternalIssueResponse from(Issue issue) {
                return new InternalIssueResponse(
                        issue.getId(),
                        issue.getAssigneeId(),
                        issue.getTitle(),
                        issue.getStatus(),
                        issue.getType(),
                        issue.getPriority(),
                        issue.getCompletedAt()
                );
        }
}
