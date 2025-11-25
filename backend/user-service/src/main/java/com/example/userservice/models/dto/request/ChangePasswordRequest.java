package com.example.userservice.models.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Запрос на смену пароля")
public record ChangePasswordRequest (
        @Schema(description = "Старый пароль", example = "oldPassword")
        @NotBlank(message = "Old password is required")
        String oldPassword,

        @Schema(description = "Новый пароль", example = "newPassword")
        @NotBlank(message = "New password is required")
        String newPassword,

        @Schema(description = "Refresh Token")
        @NotBlank(message = "Token is required")
        String refreshToken
) {}