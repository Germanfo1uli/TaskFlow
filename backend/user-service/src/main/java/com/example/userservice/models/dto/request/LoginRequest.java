package com.example.userservice.models.dto.request;

import jakarta.validation.constraints.*;

public record LoginRequest (
        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Password is required")
        String password,

        String deviceInfo
) {}