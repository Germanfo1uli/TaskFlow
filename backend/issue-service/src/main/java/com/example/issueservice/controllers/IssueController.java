package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.AssignTagsRequest;
import com.example.issueservice.dto.request.CreateIssueRequest;
import com.example.issueservice.dto.request.UpdateIssueRequest;
import com.example.issueservice.dto.response.IssueDetailResponse;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Issue Management", description = "Управление задачами в проекте")
public class IssueController {

    private final IssueService issueService;

    @Operation(
            summary = "Создание задачи (Назначение тегов сразу)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<IssueDetailResponse> createIssue(
            @Valid @RequestBody CreateIssueRequest request,
            @AuthenticationPrincipal JwtUser principal) {

        log.info("Request to create issue: {}", request.title());
        IssueDetailResponse response = issueService.createIssue(
                principal.userId(), request.projectId(), request.assigneeId(),
                request.parentId(), request.title(), request.description(),
                request.type(), request.priority(), request.tagIds());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Получение одной задачи",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/{issueId}")
    public ResponseEntity<IssueDetailResponse> getIssueById(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId) {

        log.info("Request to get issue by id: {}", issueId);
        IssueDetailResponse response = issueService.getIssueById(
                principal.userId(), issueId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Получение всех задач проекта",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping
    public ResponseEntity<List<IssueDetailResponse>> getIssuesByProject(
            @AuthenticationPrincipal JwtUser principal,
            @Valid @RequestParam Long projectId) {

        log.info("Request to get all issues for project: {}", projectId);
        List<IssueDetailResponse> response = issueService.getIssuesByProject(
                principal.userId(), projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Обновление задачи (в том числе вместе с тегами)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/{issueId}")
    public ResponseEntity<IssueDetailResponse> updateIssue(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody UpdateIssueRequest request) {

        log.info("Request to update issue {}: {}", issueId, request);
        IssueDetailResponse response = issueService.updateIssue(
                principal.userId(), issueId,
                request.title(), request.description(),
                request.priority(), request.tagIds());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Удаление задачи (каскадно - ОСТОРОЖНОЕ ИСПОЛЬЗОВАНИЕ, удалит все подзадачи, комменты и файлы)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{issueId}")
    public ResponseEntity<?> deleteIssue(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId) {

        log.info("Request to delete issue by id: {}", issueId);
        issueService.deleteIssue(principal.userId(), issueId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Назначение тегов задаче (только assignee)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/{issueId}/tags")
    public ResponseEntity<IssueDetailResponse> assignTagsBatch(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody AssignTagsRequest request) {

        log.info("Batch tag assignment request for issue {} by user {}", issueId, principal.userId());
        IssueDetailResponse response = issueService.assignTagsToIssue(
                principal.userId(), issueId, request.tagIds());
        return ResponseEntity.ok(response);
    }
}