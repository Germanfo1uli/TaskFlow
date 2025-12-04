package com.example.boardservice.controller;

import com.example.boardservice.dto.request.CreateUpdateRoleRequest;
import com.example.boardservice.dto.response.CreateProjectResponse;
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
    @PostMapping("/projects/{projectId}/roles")
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
    @PatchMapping("/projects/{projectId}/roles/{roleId}")
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
}
