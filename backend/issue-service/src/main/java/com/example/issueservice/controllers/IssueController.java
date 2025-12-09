package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.AssignTagDto;
import com.example.issueservice.dto.request.AssignUserDto;
import com.example.issueservice.dto.request.CreateIssueRequest;
import com.example.issueservice.dto.request.UpdateIssueDto;
import com.example.issueservice.dto.response.CreateIssueResponse;
import com.example.issueservice.dto.response.IssueDetailResponse;
import com.example.issueservice.security.JwtUser;
import dto.request.*;
import dto.response.*;
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
@RequestMapping("/api/projects")
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
    @PostMapping("/{projectId}/issues")
    public ResponseEntity<IssueDetailResponse> createIssue(
            @Valid @RequestBody CreateIssueRequest request,
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long projectId) {

        log.info("Request to create issue: {}", request.title());
        IssueDetailResponse response = issueService.createIssue(
                principal.userId(), projectId, request.parentId(),
                request.title(), request.description(),
                request.type(), request.priority(), request.deadline());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Получение одной задачи",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/{projectId}/issues/{issueId}")
    public ResponseEntity<IssueDetailResponse> getIssueById(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long projectId,
            @PathVariable Long issueId) {

        log.info("Request to get issue by id: {}", issueId);
        IssueDetailResponse response = issueService.getIssueById(
                principal.userId(), projectId, issueId);
        return ResponseEntity.ok(response);
    }

    // --- Получение всех задач проекта ---
    @GetMapping
    public ResponseEntity<List<IssueDetailResponse>> getIssuesByProject(@RequestParam Long projectId) {
        log.info("Request to get all issues for project: {}", projectId);

        List<IssueDetailResponse> issueSummaries = issueService.getIssueSummariesByProject(projectId);

        return ResponseEntity.ok(issueSummaries);
    }

    // --- Обновление задачи ---
    @PutMapping("/{id}")
    public ResponseEntity<com.example.issueservice.dto.response.CreateIssueResponse> updateIssue(@PathVariable Long id, @Valid @RequestBody UpdateIssueDto dto) {
        log.info("Request to update issue with id: {}", id);
        // TODO: В сервисе нужно реализовать метод updateIssue(id, dto)
        // IssueDetailsDto updatedIssue = issueService.updateIssue(id, dto);
        // return ResponseEntity.ok(updatedIssue);
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
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

    // --- Управление исполнителями ---
    @PostMapping("/{issueId}/assignees")
    public ResponseEntity<Void> addAssignee(@PathVariable Long issueId, @Valid @RequestBody AssignUserDto dto) {
        log.info("Request to assign user {} to issue {}", dto.getUserId(), issueId);
        issueService.addAssignee(issueId, dto.getUserId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{issueId}/assignees/{userId}")
    public ResponseEntity<Void> removeAssignee(@PathVariable Long issueId, @PathVariable Long userId) {
        log.info("Request to remove user {} from issue {}", userId, issueId);
        issueService.removeAssignee(issueId, userId);
        return ResponseEntity.noContent().build(); // 204 No Content
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