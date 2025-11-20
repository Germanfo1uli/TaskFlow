package com.example.userservice.controller;

import com.example.userservice.models.entity.Avatar;
import com.example.userservice.service.AvatarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
@Validated
public class AvatarController {
    public final AvatarService avatarService;

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal Long userId,
            @RequestParam("file") MultipartFile file) {

        avatarService.uploadAvatar(userId, file);

        return ResponseEntity.ok(Map.of(
                "message", "Аватарка успешно загружена",
                "avatarUrl", "/users/me/avatar"
        ));
    }

    @GetMapping("/me/avatar")
    public ResponseEntity<byte[]> getMyAvatar(@AuthenticationPrincipal Long userId) {
        return getAvatarResponse(userId);
    }

    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> getUserAvatar(@PathVariable Long userId) {
        return getAvatarResponse(userId);
    }

    private ResponseEntity<byte[]> getAvatarResponse(Long userId) {
        Avatar avatar = avatarService.findByUserId(userId)
                .orElse(null);

        if (avatar == null) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(avatar.getMimeType()));
        headers.setContentLength(avatar.getFileSize());

        // кэширование аватарок
        headers.setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic());
        headers.setExpires(Instant.now().plus(30, ChronoUnit.DAYS));

        return ResponseEntity.ok()
                .headers(headers)
                .body(avatar.getData());
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<?> deleteAvatar(@AuthenticationPrincipal Long userId) {
        avatarService.deleteAvatar(userId);
        return ResponseEntity.ok(Map.of("message", "Аватарка удалена"));
    }
}
