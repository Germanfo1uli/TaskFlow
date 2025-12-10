package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.IssueStatus;
import com.example.issueservice.dto.models.enums.IssueType;
import com.example.issueservice.dto.models.enums.Priority;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Ответ на создание задачи")
public record CreateIssueResponse (

        @Schema(description = "ID задачи", example = "123")
        Long id,

        @Schema(description = "ID проекта", example = "123")
        Long projectId,

        @Schema(description = "ID создателя задачи", example = "123")
        Long creatorId,

        @Schema(description = "ID родительской задачи", example = "123")
        Long parentId,

        @Schema(description = "Уровень задачи в иерархии", example = "1")
        Integer level,

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

        @Schema(description = "Дедлайн задачи", example = "времяяяя")
        LocalDateTime deadline,

        @Schema(description = "Дата создания", example = "времяяяя")
        LocalDateTime createdAt,

        @Schema(description = "Дата обновления", example = "времяяяя")
        LocalDateTime updatedAt
) {
        public static CreateIssueResponse from(Issue issue) {
                return new CreateIssueResponse(
                        issue.getId(),
                        issue.getProjectId(),
                        issue.getCreatorId(),
                        issue.getParentIssue().getId(),
                        issue.getLevel(),
                        issue.getTitle(),
                        issue.getDescription(),
                        issue.getStatus(),
                        issue.getType(),
                        issue.getPriority(),
                        issue.getDeadline(),
                        issue.getCreatedAt(),
                        issue.getUpdatedAt()
                );
        }
}