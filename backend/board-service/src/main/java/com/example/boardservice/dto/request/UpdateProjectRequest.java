package com.example.boardservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Запрос на обновление данных проекта")
public record UpdateProjectRequest(
        @Schema(description = "Название проекта", example = "TaskFlow")
        String name,

        @Schema(description = "Описание проекта", example = "TaskFlow - лучший проект в мире")
        String description
) {}
