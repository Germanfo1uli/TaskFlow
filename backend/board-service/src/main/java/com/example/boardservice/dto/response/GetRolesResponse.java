package com.example.boardservice.dto.response;

import com.example.boardservice.dto.data.PermissionEntry;
import com.example.boardservice.dto.models.ProjectRole;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Schema(description = "Информация о ролях в проекте")
public record GetRolesResponse (

        @Schema(description = "ID проекта", example = "123")
        Long projectId,

        @ArraySchema(
                schema = @Schema(description = "Роли проекта", implementation = PermissionEntry.class)
        )
        Set<RoleResponse> roles
) {
        public static GetRolesResponse fromEntities(Long projectId, List<ProjectRole> projectRoles) {
                Set<RoleResponse> roleResponses = projectRoles.stream()
                        .map(role -> new RoleResponse(
                                role.getId(),
                                role.getName(),
                                Boolean.TRUE.equals(role.getIsOwner()),
                                Boolean.TRUE.equals(role.getIsDefault()),
                                role.getPermissions().stream()
                                        .map(perm -> new PermissionEntry(perm.getEntity(), perm.getAction()))
                                        .collect(Collectors.toSet())
                        ))
                        .collect(Collectors.toSet());

                return new GetRolesResponse(projectId, roleResponses);
        }
}
