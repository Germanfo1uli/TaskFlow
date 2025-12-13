package com.example.userservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequest(
        @Schema(description = "Пароль пользователя", example = "Password1234")
        @NotBlank(message = "Password is required")
        String password
) {}
