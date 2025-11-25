package com.example.userservice.models.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record MyProfileResponse(
        @Schema(description = "ID пользователя", example = "123")
        Long id,

        @Schema(description = "Email пользователя", example = "user@example.com")
        String email,

        @Schema(description = "Имя пользователя", example = "Ziragon")
        String username,

        @Schema(description = "Тег пользователя", example = "1234")
        String tag,

        @Schema(description = "О себе", example = "Я лучший программист...")
        String bio,

        @Schema(description = "Дата создания аккаунта", example = "2025-01-01T10:30:00")
        LocalDateTime createdAt
) {}
