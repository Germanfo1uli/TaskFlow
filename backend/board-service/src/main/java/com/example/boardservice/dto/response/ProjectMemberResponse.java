package com.example.boardservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Полная информация об участнике проекта")
public record ProjectMemberResponse(
        @Schema(description = "ID пользователя")
        Long userId,

        @Schema(description = "Имя пользователя")
        String username,

        @Schema(description = "Тег пользователя")
        String tag,

        @Schema(description = "О себе")
        String bio,

        @Schema(description = "Айди роли в проекте")
        Long roleId,

        @Schema(description = "Роль в проекте")
        String role
) {}