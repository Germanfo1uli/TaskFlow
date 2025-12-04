package com.example.boardservice.controller;

import com.example.boardservice.dto.request.CreateProjectRequest;
import com.example.boardservice.dto.response.CreateProjectResponse;
import com.example.boardservice.dto.response.GetProjectResponse;
import com.example.boardservice.security.JwtUser;
import com.example.boardservice.service.ProjectService;
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
@RequestMapping("api")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Projects Management", description = "Управление проектами")
public class ProjectController {
    private final ProjectService projectService;

    @Operation(
            summary = "Создание проекта",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/projects")
    public ResponseEntity<CreateProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal JwtUser principal) {

        CreateProjectResponse response = projectService.createProject(
                principal.userId(), request.name(), request.key());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Создание проекта",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<GetProjectResponse> getProjectById(
            @PathVariable Long projectId,
            @AuthenticationPrincipal JwtUser principal) {

        GetProjectResponse response = projectService.getProjectById(projectId);
        return ResponseEntity.ok(response);
    }
}
