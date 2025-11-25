package com.example.userservice.models.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Запрос на обновление токена")
public record RefreshRequest(
        @Schema(description = "Refresh Token")
        @NotBlank(message = "Token is required")
        String refreshToken
) {}