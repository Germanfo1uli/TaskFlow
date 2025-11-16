package com.example.userservice.controller;

import com.example.userservice.models.dto.request.*;
import com.example.userservice.models.dto.response.LoginResponse;
import com.example.userservice.models.dto.response.TokenResponse;
import com.example.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    public final UserService userService;

    @Operation(summary = "Регистрация пользователя")
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        LoginResponse response = userService.registerAsync(
                request.email(), request.password(), request.deviceInfo()).join();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Авторизация пользователя")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = userService.loginAsync(
                request.email(), request.password(), request.deviceInfo()).join();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение новых токенов")
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @Valid @RequestBody RefreshRequest request) {

        TokenResponse response = userService.refreshTokenAsync(
                request.refreshToken(), request.deviceInfo()).join();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Смена пароля",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/change-password")
    public ResponseEntity<TokenResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal Long userId) {

        TokenResponse response = userService.changePasswordAsync(
                request.oldPassword(), request.newPassword(),
                userId, request.refreshToken(),
                request.deviceInfo()).join();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Смена почты",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/change-email")
    public ResponseEntity<TokenResponse> changeEmail(
            @Valid @RequestBody ChangeEmailRequest request,
            @AuthenticationPrincipal Long userId) {

        TokenResponse response = userService.changeEmailAsync(
                request.newEmail(), request.password(),
                userId, request.refreshToken(),
                request.deviceInfo()).join();
        return ResponseEntity.ok(response);
    }
}
