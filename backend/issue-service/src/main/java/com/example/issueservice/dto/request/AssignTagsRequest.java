package com.example.issueservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AssignTagsRequest(
        @Schema(description = "Список ID тегов для назначения (пустой список = удалить все теги)", example = "[1, 2, 3]")
        @NotNull(message = "Tag IDs list is required")
        List<Long> tagIds
) {}