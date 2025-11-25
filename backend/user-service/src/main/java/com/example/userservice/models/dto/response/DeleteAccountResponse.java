package com.example.userservice.models.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record DeleteAccountResponse (
        @Schema(description = "ID пользователя", example = "123")
        Long userId,

        @Schema(description = "Время удаления", example = "2025-01-01T10:30:00")
        LocalDateTime deletedAt,

        @Schema(description = "Сообщение об успехе")
        String message
) {
    public static DeleteAccountResponse of(Long id, LocalDateTime deletedAt) {
        return new DeleteAccountResponse(
                id,
                deletedAt,
                "Account was successfully deleted."
        );
    }
}
