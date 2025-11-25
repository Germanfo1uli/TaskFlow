package com.example.userservice.controller;

import com.example.userservice.models.dto.request.*;
import com.example.userservice.models.dto.response.*;
import com.example.userservice.security.JwtUser;
import com.example.userservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Auth Management", description = "Управление авторизацией, аутентификацией, сессиями и тд.")
public class AuthController {

    public final AuthService authService;

    @Operation(summary = "Регистрация пользователя")
    @PostMapping("/register")
    @SecurityRequirements()
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterRequest request,
            @RequestAttribute("deviceFingerprint") String deviceFingerprint) {

        LoginResponse response = authService.register(
                request.username(), request.email(), request.password(), deviceFingerprint);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Авторизация пользователя")
    @PostMapping("/login")
    @SecurityRequirements()
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            @RequestAttribute("deviceFingerprint") String deviceFingerprint) {

        LoginResponse response = authService.login(
                request.email(), request.password(), deviceFingerprint);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение новых токенов")
    @PostMapping("/refresh")
    @SecurityRequirements()
    public ResponseEntity<TokenPair> refresh(
            @Valid @RequestBody RefreshRequest request,
            @RequestAttribute("deviceFingerprint") String deviceFingerprint) {

        TokenPair response = authService.refresh(
                request.refreshToken(), deviceFingerprint);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Смена пароля",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/change-password")
    public ResponseEntity<ChangePasswordResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal JwtUser principal,
            @RequestAttribute("deviceFingerprint") String deviceFingerprint) {

        ChangePasswordResponse response = authService.changePassword(
                principal.userId(), request.oldPassword(),
                request.newPassword(), request.refreshToken(),
                deviceFingerprint);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Смена почты",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/change-email")
    public ResponseEntity<ChangeEmailResponse> changeEmail(
            @Valid @RequestBody ChangeEmailRequest request,
            @AuthenticationPrincipal JwtUser principal,
            @RequestAttribute("deviceFingerprint") String deviceFingerprint) {

        ChangeEmailResponse response = authService.changeEmail(
                principal.userId(), request.newEmail(),
                request.password(), request.refreshToken(),
                deviceFingerprint);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Логаут пользователя",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @Valid @RequestBody LogoutRequest request) {

        authService.logout(request.refreshToken());
        return ResponseEntity.ok(Map.of("message", "Logout was successfully"));
    }

    @Operation(
            summary = "Удаление учетной записи (мягкое удаление)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/account")
    public ResponseEntity<DeleteAccountResponse> deleteMyAccount(
            @AuthenticationPrincipal JwtUser principal,
            @Valid @RequestBody String password) {
        DeleteAccountResponse response = authService.deleteAccount(principal.userId(), password);
        return ResponseEntity.ok(response);
    }
}
