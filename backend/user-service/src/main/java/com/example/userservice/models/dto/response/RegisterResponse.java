package com.example.userservice.models.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Ответ регистрации пользователя")
public record RegisterResponse(
        @Schema(description = "ID пользователя", example = "123")
        Long userId,

        @Schema(description = "Имя пользователя", example = "Ziragon")
        String name,

        @Schema(description = "Email пользователя", example = "user@example.com")
        String email,

        @Schema(description = "Пара токенов")
        TokenPair pair
) {}
