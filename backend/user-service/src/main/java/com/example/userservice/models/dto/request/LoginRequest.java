package com.example.userservice.models.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Запрос на авторизацию")
public record LoginRequest (
        @Schema(description = "Email пользователя", example = "user@example.com")
        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        String email,

        @Schema(description = "Пароль пользователя", example = "Password")
        @NotBlank(message = "Password is required")
        String password
) {}