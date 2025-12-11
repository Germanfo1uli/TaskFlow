package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.TransitionRequest;
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
            summary = "Перевести задачу в другой статус",
            description = """
            Доступные переходы:
            - Developer (ASSIGNEE): IN_PROGRESS → CODE_REVIEW
            - Reviewer (CODE_REVIEWER): CODE_REVIEW → QA или IN_PROGRESS
            - QA (QA_ENGINEER): QA → STAGING или IN_PROGRESS
            """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{issueId}/status")
    public ResponseEntity<Void> transitionStatus(
            @AuthenticationPrincipal JwtUser principal,
            @PathVariable Long issueId,
            @Valid @RequestBody TransitionRequest request) {

        log.info("Transition: user {} moves issue {} to {} as {}",
                principal.userId(), issueId, request.targetStatus(), request.type());

        transitionService.transitionStatus(principal.userId(), issueId, request.type(), request.targetStatus());

        return ResponseEntity.ok().build();
    }
}