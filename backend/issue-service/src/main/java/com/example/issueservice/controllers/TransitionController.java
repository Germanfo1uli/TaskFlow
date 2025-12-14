package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.RoleTransitionRequest;
import com.example.issueservice.dto.request.StatusTransitionRequest;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.TransitionService;
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
@Tag(name = "Issue Status Transitions", description = "Управление переходами статусов задач")
public class TransitionController {

    private final TransitionService transitionService;

    @Operation(
            summary = "Перевести задачу в любой статус (для владельца проекта)",
            description = "Требует права FULL_TRANSITION. Не требует назначения на задачу.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{issueId}/status")
    public ResponseEntity<Void> transitionAsOwner(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody StatusTransitionRequest request) {

        log.info("Owner transition: user {} moves issue {} to {}",
                principal.userId(), issueId, request.targetStatus());

        transitionService.transitionAsOwner(principal.userId(), issueId, request.targetStatus());

        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Перевести задачу в статус как назначенный исполнитель",
            description = """
            Доступные переходы (в скобках строка для targetStatus):
            - Developer (ASSIGNEE): IN_PROGRESS → CODE_REVIEW
            - Reviewer (CODE_REVIEWER): CODE_REVIEW → QA или IN_PROGRESS
            - QA (QA_ENGINEER): QA → STAGING или IN_PROGRESS
            """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{issueId}/transitions/role")
    public ResponseEntity<Void> transitionAsRole(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody RoleTransitionRequest request) {

        log.info("Role transition: user {} moves issue {} to {} as {}",
                principal.userId(), issueId, request.targetStatus(), request.type());

        transitionService.transitionAsRole(principal.userId(), issueId,
                request.type(), request.targetStatus());

        return ResponseEntity.ok().build();
    }
}