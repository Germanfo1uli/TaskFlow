package com.example.issueservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record InternalProjectResponse(
        @Schema(description = "ID проекта", example = "123")
        Long projectId,

        @Schema(description = "ID владельца", example = "123")
        Long ownerId,

        @Schema(description = "Имя проекта", example = "TaskFlow")
        String name,

        @Schema(description = "Описание проекта", example = "TaskFlow - класс")
        String description,

        @Schema(description = "Время создания проекта")
        LocalDateTime createdAt
) {}
