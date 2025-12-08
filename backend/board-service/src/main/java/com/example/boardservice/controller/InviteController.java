package com.example.boardservice.controller;

import com.example.boardservice.dto.request.InviteUserRequest;
import com.example.boardservice.security.JwtUser;
import com.example.boardservice.service.ProjectInviteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/projects")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Invite Management", description = "Обработка приглашений в проект")
public class InviteController {
    public final ProjectInviteService inviteService;

    @Operation(
            summary = "Присоединиться к проекту по ссылке",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/join/{token}")
    public ResponseEntity<Map<String, Object>> join(
            @PathVariable String token,
            @AuthenticationPrincipal JwtUser principal) {

        Long projectId = inviteService.joinByInvite(principal.userId(), token);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "projectId", projectId
        ));
    }

    @Operation(
            summary = "Пригласить пользователя в проект",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{projectId}/invite")
    public ResponseEntity<String> invite(
            @PathVariable Long projectId,
            @Valid @RequestBody InviteUserRequest request,
            @AuthenticationPrincipal JwtUser principal) {

        inviteService.inviteUser(principal.userId(), projectId, request.userId(), request.roleId());
        return ResponseEntity.ok("Success");
    }

    @Operation(
            summary = "Пересоздать пригласительную ссылку",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/{projectId}/invite/regenerate")
    public ResponseEntity<String> regenerateInvite(
            @PathVariable Long projectId,
            @AuthenticationPrincipal JwtUser principal) {

        String response = inviteService.regenerateInvite(principal.userId(), projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Получить ссылку на приглашение",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/{projectId}/invite")
    public ResponseEntity<String> getInviteLink(
            @PathVariable Long projectId,
            @AuthenticationPrincipal JwtUser principal) {

        String response = inviteService.getInviteLink(principal.userId(), projectId);
        return ResponseEntity.ok(response);
    }
}
