package com.example.issueservice.controllers;

import com.example.issueservice.dto.data.IssueBatchRequest;
import com.example.issueservice.dto.response.InternalIssueResponse;
import com.example.issueservice.security.SystemPrincipal;
import com.example.issueservice.services.IssueService;
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

import java.util.List;

@RestController
@RequestMapping("api/internal")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('SYSTEM')")
@SecurityRequirements
@Tag(name = "Internal Management", description = "Внутренние запросы для других микросервисов")
public class InternalController {


    private final IssueService issueService;

    @Operation(summary = "Получение информации о задаче по issueId")
    @GetMapping("/issues/{issueId}")
    public ResponseEntity<InternalIssueResponse> getIssueById(
            @AuthenticationPrincipal SystemPrincipal principal,
            @PathVariable Long issueId) {

        if (principal == null) {
            throw new AccessDeniedException("Missing service authentication");
        }

        log.info("Service {} requested info for issue {}", principal.getUsername(), issueId);
        InternalIssueResponse response = issueService.getIssueInternal(issueId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение информации о задачах по projectId")
    @GetMapping("/issues")
    public ResponseEntity<List<InternalIssueResponse>> getIssuesByProjectId(
            @AuthenticationPrincipal SystemPrincipal principal,
            @RequestParam Long projectId) {

        if (principal == null) {
            throw new AccessDeniedException("Missing service authentication");
        }

        log.info("Service {} requested info for issues of project {}", principal.getUsername(), projectId);
        List<InternalIssueResponse> response = issueService.getIssuesInternal(projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Старт спринта")
    @PostMapping("/issues")
    public ResponseEntity<List<InternalIssueResponse>> startSprint(
            @AuthenticationPrincipal SystemPrincipal principal,
            @RequestParam Long projectId,
            @RequestBody IssueBatchRequest issuesIds) {

        if (principal == null) {
            throw new AccessDeniedException("Missing service authentication");
        }

        log.info("Service {} requested info for start sprint of project {}", principal.getUsername(), projectId);
        List<InternalIssueResponse> response = issueService.startSprint(projectId, issuesIds);
        return ResponseEntity.ok(response);
    }
}
