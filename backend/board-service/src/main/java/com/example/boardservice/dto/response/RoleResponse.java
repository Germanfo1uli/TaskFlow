package com.example.boardservice.dto.response;

import com.example.boardservice.dto.data.PermissionEntry;
import com.example.boardservice.dto.models.RolePermission;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Set;

@Schema(description = "Ответ на создание/изменение роли")
public record RoleResponse (
        @Schema(description = "ID роли", example = "123")
        Long id,

        @Schema(description = "Название роли", example = "User")
        String name,

        @Schema(description = "Является ли роль базовой", example = "false")
        boolean isDefault,

        @Schema(description = "Права роли", example = "ISSUE.VIEW")
        Set<PermissionEntry> permissions
) {}
