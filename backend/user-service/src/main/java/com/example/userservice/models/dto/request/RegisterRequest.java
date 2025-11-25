package com.example.userservice.models.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Запрос на регистрацию пользователя")
public record RegisterRequest (
        @Schema(description = "Имя пользователя", example = "Ziragon")
        @NotBlank(message = "Name is required")
        String name,

        @Schema(description = "Email пользователя", example = "user@example.com")
        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        String email,

        @Schema(description = "Пароль пользователя", example = "Password", minLength = 8)
        @NotBlank(message = "Password is required")
        String password
) {}
