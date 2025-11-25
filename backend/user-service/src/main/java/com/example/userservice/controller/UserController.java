package com.example.userservice.controller;

import com.example.userservice.models.dto.request.ChangeProfileRequest;
import com.example.userservice.models.dto.response.ChangeProfileResponse;
import com.example.userservice.models.dto.response.MyProfileResponse;
import com.example.userservice.models.dto.response.PublicProfileResponse;
import com.example.userservice.security.JwtUser;
import com.example.userservice.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User Management", description = "Управление профилями и личной информацией")
public class UserController {

    public final UserService userService;

    @Operation(summary = "Обновление профиля пользователя")
    @PatchMapping("/me/update")
    public ResponseEntity<ChangeProfileResponse> updateUserProfile(
            @Valid @RequestBody ChangeProfileRequest request,
            @AuthenticationPrincipal JwtUser principal) {

        ChangeProfileResponse response = userService.updateProfileById(
                principal.userId(), request.username(), request.bio());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение профиля пользователя (ЛИЧНОГО ПРОФИЛЯ, userId берется из Access Token)")
    @GetMapping("/me/profile")
    public ResponseEntity<MyProfileResponse> getMyProfile(
            @AuthenticationPrincipal JwtUser principal) {

        MyProfileResponse response = userService.getMyProfile(principal.userId());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение профиля пользователя по userId")
    @GetMapping("/{userId}/profile")
    public ResponseEntity<PublicProfileResponse> getProfileById(
            @PathVariable Long userId) {

        PublicProfileResponse response = userService.getProfileById(userId);
        return ResponseEntity.ok(response);
    }
}
