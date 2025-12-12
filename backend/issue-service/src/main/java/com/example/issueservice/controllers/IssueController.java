package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.AssignTagDto;
import com.example.issueservice.dto.request.CreateIssueRequest;
import com.example.issueservice.dto.response.IssueDetailResponse;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
            summary = "Создание задачи",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<IssueDetailResponse> createIssue(
            @Valid @RequestBody CreateIssueRequest request,
            @AuthenticationPrincipal JwtUser principal) {

        log.info("Request to create issue: {}", request.title());
        IssueDetailResponse response = issueService.createIssue(
                principal.userId(), request.projectId(), request.parentId(),
                request.title(), request.description(),
                request.type(), request.priority());
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

    // --- Удаление задачи ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        log.info("Request to delete issue with id: {}", id);
        // TODO: В сервисе нужно реализовать метод deleteIssue(id)
        // issueService.deleteIssue(id);
        // return ResponseEntity.noContent().build();
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    // --- Управление тегами (будет использовать TagService) ---
    @PostMapping("/{issueId}/tags")
    public ResponseEntity<Void> assignTagToIssue(@PathVariable Long issueId, @Valid @RequestBody AssignTagDto dto) {
        log.info("Request to assign tag {} to issue {}", dto.getTagId(), issueId);
        // tagService.assignTagToIssue(issueId, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{issueId}/tags/{tagId}")
    public ResponseEntity<Void> removeTagFromIssue(@PathVariable Long issueId, @PathVariable Long tagId) {
        log.info("Request to remove tag {} from issue {}", tagId, issueId);
        // tagService.removeTagFromIssue(issueId, tagId);
        return ResponseEntity.noContent().build();
    }
}