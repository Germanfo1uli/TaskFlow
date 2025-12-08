package com.example.boardservice.controller;

import com.example.boardservice.dto.request.CreateProjectRequest;
import com.example.boardservice.dto.request.InviteUserRequest;
import com.example.boardservice.security.JwtUser;
import com.example.boardservice.service.ProjectInviteService;
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

    @PostMapping("/join/{token}")
    public ResponseEntity<Map<String, Object>> join(
            @PathVariable String token,
            @AuthenticationPrincipal JwtUser principal) {

        Long projectId = inviteService.joinByInvite(token, principal.userId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "projectId", projectId
        ));
    }

    @PostMapping("/{projectId}/invite")
    public ResponseEntity<String> invite(
            @PathVariable Long projectId,
            @Valid @RequestBody InviteUserRequest request,
            @AuthenticationPrincipal JwtUser principal) {

        inviteService.inviteUser(principal.userId(), projectId, request.userId(), request.roleId());
        return ResponseEntity.ok("Success");
    }
}
