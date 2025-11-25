package com.example.userservice.models.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Ответ на смену пароля")
public record ChangePasswordResponse(
        @Schema(description = "ID пользователя", example = "123")
        Long userId,

        @Schema(description = "Время изменения", example = "2025-01-01T10:30:00")
        LocalDateTime changedAt,

        @Schema(description = "Сообщение об успехе")
        String message,

        @Schema(description = "Пара токенов")
        TokenPair pair
) {
        public static ChangePasswordResponse of(Long id, LocalDateTime changedAt, TokenPair pair) {
                return new ChangePasswordResponse(
                        id,
                        changedAt,
                        "Password successfully changed. All other sessions terminated.",
                        pair
                );
        }
}