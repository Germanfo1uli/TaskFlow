package com.example.boardservice.dto.request;

import com.example.boardservice.dto.data.PermissionEntry;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

@Schema(description = "Запрос на создание/обновление роли")
public record CreateUpdateRoleRequest (
        @Schema(description = "Название роли", example = "User")
        String name,

        @ArraySchema(
                schema = @Schema(description = "Набор прав роли", implementation = PermissionEntry.class),
                minItems = 1
        )
        @NotNull(message = "Permissions cannot be null")
        @Size(min = 1, message = "Role must have at least one permission")
        Set<PermissionEntry> permissions
) {}
