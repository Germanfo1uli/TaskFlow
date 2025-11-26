package com.example.userservice.models.dto.response;

import com.example.userservice.models.entity.User;
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
        String bio,

        @Schema(description = "Дата создания аккаунта", example = "2025-01-01T10:30:00")
        LocalDateTime createdAt
) {
        public static PublicProfileResponse fromUser(User user) {
                if (user == null) {
                        throw new IllegalArgumentException("User cannot be null");
                }
                return new PublicProfileResponse(
                        user.getId(),      // Предполагаю, что в User есть getId()
                        user.getUsername(), // getUsername()
                        user.getTag(),     // getTag()
                        user.getBio(),     // getBio()
                        user.getCreatedAt() // getCreatedAt()
                );
        }
}
