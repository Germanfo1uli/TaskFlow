package com.example.userservice.models.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Запрос на изменение данных профиля")
public record ChangeProfileRequest (
        @Schema(description = "Имя пользователя (латиница и цифры)", example = "Ziragon")
        @NotBlank(message = "Username is required")
        @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username must contain only English letters and digits")
        @Size(min = 3, max = 32, message = "Username must be 3-32 characters")
        String username,

        @Schema(description = "О себе (необязательно)", example = "Я лучший программист...")
        String bio
) {}
