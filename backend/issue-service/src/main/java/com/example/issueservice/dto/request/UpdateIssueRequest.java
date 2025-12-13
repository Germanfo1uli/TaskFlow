package com.example.issueservice.dto.request;

import com.example.issueservice.dto.models.enums.Priority;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record UpdateIssueRequest(
        @Schema(description = "Название задачи", example = "Обновленное название")
        String title,

        @Schema(description = "Описание задачи", example = "Обновленное описание")
        String description,

        @Schema(description = "Приоритет задачи", example = "HIGH")
        Priority priority,

        @Schema(description = "ID тегов (null = не менять теги, [] = удалить все теги, [1,2] = заменить на указанные)",
                example = "[1, 2]")
        List<Long> tagIds
) {}