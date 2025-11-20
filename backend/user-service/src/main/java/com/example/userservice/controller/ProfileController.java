package com.example.userservice.controller;

import com.example.userservice.models.dto.request.ChangeProfileRequest;
import com.example.userservice.models.dto.response.ChangeProfileResponse;
import com.example.userservice.models.dto.response.UserProfileResponse;
import com.example.userservice.service.ProfileService;
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
public class ProfileController {

    public final ProfileService profileService;

    @Operation(summary = "Обновление профиля пользователя")
    @PatchMapping("/me/update")
    public ResponseEntity<ChangeProfileResponse> updateUserProfile(
            @Valid @RequestBody ChangeProfileRequest request,
            @AuthenticationPrincipal Long userId) {

        ChangeProfileResponse response = profileService.updateProfileByIdAsync(
                userId, request.name(), request.bio()).join();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение профиля пользователя (ЛИЧНОГО ПРОФИЛЯ, userId берется из Access Token)")
    @GetMapping("/me/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal Long userId) {

        UserProfileResponse response = profileService.getProfileByIdAsync(userId).join();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение профиля пользователя по userId")
    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileResponse> getUserProfileById(
            @PathVariable Long userId) {

        UserProfileResponse response = profileService.getProfileByIdAsync(userId).join();
        return ResponseEntity.ok(response);
    }
}
