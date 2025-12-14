package com.example.boardservice.controller;

import com.example.boardservice.dto.response.InternalProjectResponse;
import com.example.boardservice.dto.response.MemberExistResponse;
import com.example.boardservice.dto.response.UserPermissionsResponse;
import com.example.boardservice.security.SystemPrincipal;
import com.example.boardservice.service.AuthService;
import com.example.boardservice.service.ProjectMemberService;
import com.example.boardservice.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/internal")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('SYSTEM')")
@SecurityRequirements
@Tag(name = "Internal Management", description = "Внутренние запросы для других микросервисов")
public class InternalController {

    private final ProjectService projectService;
    private final ProjectMemberService memberService;
    private final AuthService authService;

    @Operation(summary = "Получение информации о проекте по projectId")
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<InternalProjectResponse> getProjectById(
            @AuthenticationPrincipal SystemPrincipal principal,
            @PathVariable Long projectId) {

        if (principal == null) {
            throw new AccessDeniedException("Missing service authentication");
        }

        log.info("Service {} requested info for project {}", principal.getUsername(), projectId);
        InternalProjectResponse response = projectService.getProjectInternal(projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение всех прав пользователя в проекте")
    @GetMapping("/permissions")
    public ResponseEntity<UserPermissionsResponse> getUserPermissions(
            @AuthenticationPrincipal SystemPrincipal principal,
            @RequestParam Long userId,
            @RequestParam Long projectId) {

        if (principal == null) {
            throw new AccessDeniedException("Missing service authentication");
        }

        log.info("Service {} requested permissions for user {} in project {}",
                principal.getUsername(), userId, projectId);

        UserPermissionsResponse response = authService.getUserPermissions(userId, projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Запрос на пользователя в проекте")
    @GetMapping("/projects/{projectId}/members/{userId}")
    public ResponseEntity<MemberExistResponse> getMember(
            @AuthenticationPrincipal SystemPrincipal principal,
            @PathVariable Long projectId,
            @PathVariable Long userId) {

        if (principal == null) {
            throw new AccessDeniedException("Missing service authentication");
        }

        log.info("Service {} requested for user {} in project {}",
                principal.getUsername(), userId, projectId);

        MemberExistResponse response = memberService.getMemberInProject(userId, projectId);
        return ResponseEntity.ok(response);
    }
}
