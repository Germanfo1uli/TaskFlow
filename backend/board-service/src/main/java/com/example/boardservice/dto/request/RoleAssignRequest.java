package com.example.boardservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Запрос на смену роли пользователя")
public record RoleAssignRequest(
        @Schema(description = "Id пользователя", example = "123")
        @NotNull(message = "UserId is required")
        Long userId,

        @Schema(description = "Id роли", example = "123")
        @NotNull(message = "RoleId is required")
        Long roleId
) {}
