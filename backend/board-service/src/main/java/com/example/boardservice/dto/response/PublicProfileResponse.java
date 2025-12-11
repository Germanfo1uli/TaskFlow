package com.example.boardservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record PublicProfileResponse(
        @Schema(description = "ID пользователя", example = "123")
        Long id,

        @Schema(description = "Имя пользователя", example = "Ziragon")
        String username,

        @Schema(description = "Тег пользователя", example = "1234")
        String tag,

        @Schema(description = "О себе", example = "Я лучший программист...")
        String bio
) {}
