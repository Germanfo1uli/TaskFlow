package com.example.userservice.controller;

import com.example.userservice.models.entity.Avatar;
import com.example.userservice.security.JwtUser;
import com.example.userservice.service.AvatarService;
import com.example.userservice.service.AvatarValidator;
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
    public final AvatarValidator validator;

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal JwtUser principal,
            @RequestParam("file") MultipartFile file) {

        validator.validate(file);
        avatarService.uploadAvatar(principal.userId(), file);

        return ResponseEntity.ok(Map.of(
                "message", "Аватарка успешно загружена",
                "avatarUrl", "/users/me/avatar"
        ));
    }

    @GetMapping("/me/avatar")
    public ResponseEntity<byte[]> getMyAvatar(@AuthenticationPrincipal JwtUser principal) {
        return getAvatarResponse(principal.userId());
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
    public ResponseEntity<?> deleteAvatar(@AuthenticationPrincipal JwtUser principal) {
        avatarService.deleteAvatar(principal.userId());
        return ResponseEntity.ok(Map.of("message", "Аватарка удалена"));
    }
}
