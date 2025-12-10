package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.IssueStatus;
import com.example.issueservice.dto.models.enums.IssueType;
import com.example.issueservice.dto.models.enums.Priority;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Детальная информация о задаче с данными о пользователях")
public record IssueDetailResponse(
        @Schema(description = "ID задачи", example = "123")
        Long id,

        @Schema(description = "ID проекта", example = "123")
        Long projectId,

        @Schema(description = "ID родительской задачи", example = "123")
        Long parentId,

        @Schema(description = "Название задачи", example = "Сделать микросервисы")
        String title,

        @Schema(description = "Описание задачи", example = "Сделать по отдельности каждый микросервис, связать их")
        String description,

        @Schema(description = "Статус задачи", example = "TO_DO")
        IssueStatus status,

        @Schema(description = "Тип задачи", example = "EPIC")
        IssueType type,

        @Schema(description = "Приоритет задачи", example = "MEDIUM")
        Priority priority,

        @Schema(description = "Дедлайн задачи", example = "2025-02-01T12:00:00")
        LocalDateTime deadline,

        @Schema(description = "Дата создания", example = "2025-01-20T10:30:00")
        LocalDateTime createdAt,

        @Schema(description = "Дата обновления", example = "2025-01-20T15:30:00")
        LocalDateTime updatedAt,

        @Schema(description = "Данные о создателе задачи")
        PublicProfileResponse creator,

        @Schema(description = "Данные об исполнителе")
        PublicProfileResponse assignee,

        @Schema(description = "Данные о code reviewer")
        PublicProfileResponse reviewer,

        @Schema(description = "Данные о QA engineer")
        PublicProfileResponse qa
) {
        public static IssueDetailResponse fromIssue(Issue issue) {
                return new IssueDetailResponse(
                        issue.getId(),
                        issue.getProjectId(),
                        issue.getParentIssue() != null ? issue.getParentIssue().getId() : null,
                        issue.getTitle(),
                        issue.getDescription(),
                        issue.getStatus(),
                        issue.getType(),
                        issue.getPriority(),
                        issue.getDeadline(),
                        issue.getCreatedAt(),
                        issue.getUpdatedAt(),
                        null,
                        null,
                        null,
                        null
                );
        }

        public static IssueDetailResponse withAssignee(
                Issue issue,
                PublicProfileResponse assignee) {
                return new IssueDetailResponse(
                        issue.getId(),
                        issue.getProjectId(),
                        issue.getParentIssue() != null ? issue.getParentIssue().getId() : null,
                        issue.getTitle(),
                        issue.getDescription(),
                        issue.getStatus(),
                        issue.getType(),
                        issue.getPriority(),
                        issue.getDeadline(),
                        issue.getCreatedAt(),
                        issue.getUpdatedAt(),
                        null,
                        assignee,
                        null,
                        null
                );
        }

        public static IssueDetailResponse withUsers(
                Issue issue,
                PublicProfileResponse creator,
                PublicProfileResponse assignee,
                PublicProfileResponse reviewer,
                PublicProfileResponse qa) {
                return new IssueDetailResponse(
                        issue.getId(),
                        issue.getProjectId(),
                        issue.getParentIssue() != null ? issue.getParentIssue().getId() : null,
                        issue.getTitle(),
                        issue.getDescription(),
                        issue.getStatus(),
                        issue.getType(),
                        issue.getPriority(),
                        issue.getDeadline(),
                        issue.getCreatedAt(),
                        issue.getUpdatedAt(),
                        creator,
                        assignee,
                        reviewer,
                        qa
                );
        }
}