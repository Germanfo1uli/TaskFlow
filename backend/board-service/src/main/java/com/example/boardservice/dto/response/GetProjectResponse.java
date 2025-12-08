package com.example.boardservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Информация о проекте")
public record GetProjectResponse (
        @Schema(description = "ID проекта", example = "123")
        Long projectId,

        @Schema(description = "ID владельца", example = "123")
        Long ownerId,

        @Schema(description = "Имя проекта", example = "TaskFlow")
        String name,

        @Schema(description = "Краткий тег проекта", example = "TF")
        String key,

        @Schema(description = "Время создания проекта")
        LocalDateTime createdAt
) {}
