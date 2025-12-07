package com.example.boardservice.controller;

import com.example.boardservice.security.JwtUser;
import com.example.boardservice.service.ProjectInviteService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/invite")
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

    @PostMapping("/project/{projectId}/user/{userId}")
    public ResponseEntity<String> invite(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal JwtUser principal) {

        inviteService.inviteUser(principal.userId(), projectId, userId);
        return ResponseEntity.ok("Success");
    }
}
