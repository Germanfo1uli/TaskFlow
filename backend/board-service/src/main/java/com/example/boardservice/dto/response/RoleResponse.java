package com.example.boardservice.dto.response;

import com.example.boardservice.dto.data.PermissionEntry;
import com.example.boardservice.dto.models.ProjectRole;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Set;
import java.util.stream.Collectors;

@Schema(description = "Ответ на создание/изменение роли")
public record RoleResponse (
        @Schema(description = "ID роли", example = "123")
        Long id,

        @Schema(description = "Название роли", example = "User")
        String name,

        @Schema(description = "Является ли роль базовой", example = "false")
        boolean isOwner,

        @Schema(description = "Является ли роль базовой", example = "false")
        boolean isDefault,

        @ArraySchema(
                schema = @Schema(description = "Набор прав роли", implementation = PermissionEntry.class)
        )
        Set<PermissionEntry> permissions
) {
        public static RoleResponse fromEntity(ProjectRole role) {
                boolean isOwner = role.getIsOwner() != null && role.getIsOwner();
                boolean isDefault = role.getIsDefault() != null && role.getIsDefault();

                Set<PermissionEntry> permissionEntries = role.getPermissions().stream()
                        .map(perm -> new PermissionEntry(perm.getEntity(), perm.getAction()))
                        .collect(Collectors.toSet());

                return new RoleResponse(
                        role.getId(),
                        role.getName(),
                        isOwner,
                        isDefault,
                        permissionEntries
                );
        }
}
