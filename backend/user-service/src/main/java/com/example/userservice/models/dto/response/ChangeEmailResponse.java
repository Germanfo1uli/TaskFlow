package com.example.userservice.models.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Ответ на смену почты")
public record ChangeEmailResponse(
        @Schema(description = "ID пользователя", example = "123")
        Long userId,

        @Schema(description = "Время изменения", example = "2025-01-01T10:30:00")
        LocalDateTime changedAt,

        @Schema(description = "Сообщение об успехе")
        String message,

        @Schema(description = "Новый email", example = "new@example.com")
        String newEmail,

        @Schema(description = "Пара токенов")
        TokenPair pair
) {
    public static ChangeEmailResponse of(Long id, LocalDateTime changedAt, String newEmail, TokenPair pair) {
        return new ChangeEmailResponse(
                id,
                changedAt,
                "Email was successfully changed. All other sessions terminated.",
                newEmail,
                pair
        );
    }
}
