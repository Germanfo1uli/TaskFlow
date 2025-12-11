package com.example.issueservice.controllers;

import com.example.issueservice.dto.models.enums.AssignmentType;
import com.example.issueservice.dto.request.AddAssigneeRequest;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.AssignService;
import com.example.issueservice.services.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Assignee Management", description = "Управление ответственными за задачу в проекте")
public class AssigneeController {

    private final AssignService assignService;

    @Operation(
            summary = "Назначение исполнителя на задачу (Для owner) (type регулирует нужное назначение)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{issueId}/assignees")
    public ResponseEntity<Void> addAssignee(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody AddAssigneeRequest request) {

        log.info("Request to assign user {} to issue {}", request.userId(), issueId);
        assignService.assignUserTo(principal.userId(), issueId, request.userId(), request.type());
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Стать исполнителем задачи (для Developer) (type регулирует нужное назначение)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{issueId}/assignees/self")
    public ResponseEntity<Void> assignSelf(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody AssignmentType type) {

        log.info("Request to assign self user {} to issue {}", principal.userId(), issueId);
        assignService.assignSelf(principal.userId(), issueId, type);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Удаление исполнителя с задачи (type регулирует нужное назначение)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{issueId}/assignees")
    public ResponseEntity<Void> removeAssignee(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody AssignmentType type) {

        log.info("Request to remove assignee from issue {}", issueId);
        assignService.removeAssignee(principal.userId(), issueId, type);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Удаление своего исполнения с задачи (type регулирует нужное назначение)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{issueId}/assignees/own")
    public ResponseEntity<Void> removeSelfAssign(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody AssignmentType type) {

        log.info("Request to remove self assign from issue {}", issueId);
        assignService.removeSelfAssign(principal.userId(), issueId, type);
        return ResponseEntity.noContent().build();
    }
}
