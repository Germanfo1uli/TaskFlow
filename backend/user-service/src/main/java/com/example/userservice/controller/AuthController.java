package com.example.userservice.controller;

import com.example.userservice.models.dto.request.LoginRequest;
import com.example.userservice.models.dto.request.RefreshRequest;
import com.example.userservice.models.dto.request.RegisterRequest;
import com.example.userservice.models.dto.response.LoginResponse;
import com.example.userservice.models.dto.response.TokenResponse;
import com.example.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    public final UserService userService;

    @PostMapping("/register")
    public CompletableFuture<ResponseEntity<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return userService.registerAsync(request.email(), request.password(), request.deviceInfo())
                .thenApply(ResponseEntity::ok);
    }

    @PostMapping("/login")
    public CompletableFuture<ResponseEntity<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return userService.loginAsync(request.email(), request.password(), request.deviceInfo())
                .thenApply(ResponseEntity::ok);
    }

    @PostMapping("/refresh")
    public CompletableFuture<ResponseEntity<TokenResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        return userService.refreshTokenAsync(request.refreshToken(), request.deviceInfo())
                .thenApply(ResponseEntity::ok);
    }
}
