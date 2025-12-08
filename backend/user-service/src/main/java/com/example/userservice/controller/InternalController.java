package com.example.userservice.controller;

import com.example.userservice.dto.response.PublicProfileResponse;
import com.example.userservice.security.SystemPrincipal;
import com.example.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/internal")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('SYSTEM')")
@SecurityRequirements
@Tag(name = "Internal Management", description = "Внутренние запросы для других микросервисов")
public class InternalController {

    private final UserService userService;

    @Operation(summary = "Получение профиля пользователя по userId")
    @GetMapping("/users/{userId}")
    public ResponseEntity<PublicProfileResponse> getProfileById(
            @AuthenticationPrincipal SystemPrincipal principal,
            @PathVariable Long userId) {

        if (principal == null) {
            throw new AccessDeniedException("Missing service authentication");
        }

        log.info("Service {} requested profile for user {}", principal.getUsername(), userId);
        PublicProfileResponse response = userService.getProfileById(userId);
        return ResponseEntity.ok(response);
    }
}
