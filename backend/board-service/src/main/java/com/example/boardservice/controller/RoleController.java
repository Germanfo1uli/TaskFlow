package com.example.boardservice.controller;

import com.example.boardservice.dto.request.CreateUpdateRoleRequest;
import com.example.boardservice.dto.request.RoleAssignRequest;
import com.example.boardservice.dto.response.GetRolesResponse;
import com.example.boardservice.dto.response.RoleResponse;
import com.example.boardservice.security.JwtUser;
import com.example.boardservice.service.ProjectRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/projects")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Roles Management", description = "Управление ролями в проекте")
public class RoleController {
    private final ProjectRoleService roleService;

    @Operation(
            summary = "Создание роли",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{projectId}/roles")
    public ResponseEntity<RoleResponse> createRole(
            @Valid @RequestBody CreateUpdateRoleRequest request,
            @PathVariable Long projectId,
            @AuthenticationPrincipal JwtUser principal) {

        RoleResponse response = roleService.createRole(
                principal.userId(), projectId, request.isDefault(),
                request.name(), request.permissions());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Обновление роли",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/{projectId}/roles/{roleId}")
    public ResponseEntity<RoleResponse> updateRole(
            @Valid @RequestBody CreateUpdateRoleRequest request,
            @PathVariable Long projectId,
            @PathVariable Long roleId,
            @AuthenticationPrincipal JwtUser principal) {

        RoleResponse response = roleService.updateRole(
                principal.userId(), roleId, projectId,
                request.isDefault(), request.name(), request.permissions());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Удаление роли",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{projectId}/roles/{roleId}")
    public ResponseEntity<RoleResponse> deleteRole(
            @PathVariable Long projectId,
            @PathVariable Long roleId,
            @AuthenticationPrincipal JwtUser principal) {

        roleService.deleteRole(principal.userId(), roleId, projectId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Получение ролей проекта",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/{projectId}/roles")
    public ResponseEntity<GetRolesResponse> getRoles(
            @PathVariable Long projectId,
            @AuthenticationPrincipal JwtUser principal) {

        GetRolesResponse response = roleService.getRolesByProjectId(principal.userId(), projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Назначение роли",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/{projectId}/users/{userId}")
    public ResponseEntity<?> assignRole(
            @PathVariable Long projectId,
            @Valid @RequestBody RoleAssignRequest request,
            @AuthenticationPrincipal JwtUser principal) {

        roleService.assignRole(principal.userId(), projectId, request.userId(), request.roleId());
        return ResponseEntity.ok().build();
    }
}
