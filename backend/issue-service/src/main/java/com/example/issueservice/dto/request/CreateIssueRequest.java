package com.example.issueservice.dto.request;

import com.example.issueservice.dto.models.enums.IssueType;
import com.example.issueservice.dto.models.enums.Priority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateIssueRequest(
        @Schema(description = "ID проекта", example = "123")
        @NotNull(message = "ProjectID is required")
        Long projectId,

        @Schema(description = "ID родительской задачи", example = "123")
        Long parentId,

        @Schema(description = "Название задачи", example = "Сделать микросервисы")
        @NotNull(message = "Title is required")
        String title,

        @Schema(description = "Описание задачи", example = "Сделать по отдельности каждый микросервис, связать их")
        @NotNull(message = "Description is required")
        String description,

        @Schema(description = "Тип задачи", example = "EPIC")
        @NotNull(message = "Type is required")
        IssueType type,

        @Schema(description = "Приоритет задачи", example = "MEDIUM")
        @NotNull(message = "Priority is required")
        Priority priority,

        @Schema(description = "ID тегов для назначения задаче", example = "[1, 2, 3]")
        List<Long> tagIds
) {}
