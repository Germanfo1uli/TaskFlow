package com.example.boardservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Запрос на смену роли пользователя")
public record RoleAssignRequest(
        @Schema(description = "Id пользователя", example = "123")
        @NotBlank(message = "UserId is required")
        Long userId,

        @Schema(description = "Id роли", example = "123")
        @NotBlank(message = "RoleId is required")
        Long roleId
) {}
