package com.example.userservice.models.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Запрос на смену почты")
public record ChangeEmailRequest (
        @NotBlank(message = "Email is required")
        String newEmail,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Token is required")
        String refreshToken
) {}
