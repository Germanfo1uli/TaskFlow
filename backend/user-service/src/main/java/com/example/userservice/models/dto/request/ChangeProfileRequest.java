package com.example.userservice.models.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Запрос на изменение данных профиля")
public record ChangeProfileRequest (
        @Schema(description = "Имя пользователя", example = "Ziragon")
        String name,

        @Schema(description = "О себе (необязательно)", example = "Я лучший программист...")
        String bio
) {}
