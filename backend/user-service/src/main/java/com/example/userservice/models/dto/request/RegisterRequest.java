package com.example.userservice.models.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Запрос на регистрацию пользователя")
public record RegisterRequest (
        @Schema(description = "Имя пользователя (латиница и цифры)", example = "Ziragon")
        @NotBlank(message = "Username is required")
        @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username must contain only English letters and digits")
        @Size(min = 3, max = 32, message = "Username must be 3-32 characters")
        String username,

        @Schema(description = "Email пользователя", example = "user@example.com")
        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        String email,

        @Schema(description = "Пароль (мин. 12 символов, A-Z, a-z, 0-9)", example = "Password1234")
        @NotBlank(message = "Password is required")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{12,}$",
                message = "Password must be at least 12 characters and contain uppercase, lowercase and digit"
        )
        String password
) {}
