package com.example.userservice.models.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Ответ на изменение данных профиля")
public record ChangeProfileResponse (
        @Schema(description = "Имя пользователя", example = "Ziragon")
        String name,

        @Schema(description = "Тег пользователя", example = "1234")
        String tag,

        @Schema(description = "О себе (необязательно)", example = "Я лучший программист...")
        String bio
) {}
