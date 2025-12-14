package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.Attachment;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record AttachmentResponse(
        @Schema(description = "ID вложения", example = "123")
        Long id,

        @Schema(description = "Оригинальное имя файла", example = "design.pdf")
        String fileName,

        @Schema(description = "Размер файла в байтах", example = "2048576")
        Long fileSize,

        @Schema(description = "MIME-тип", example = "application/pdf")
        String contentType,

        @Schema(description = "Дата загрузки")
        LocalDateTime createdAt,

        @Schema(description = "ID пользователя, загрузившего файл", example = "42")
        Long createdBy
) {
    public static AttachmentResponse from(Attachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFileSize(),
                attachment.getContentType(),
                attachment.getCreatedAt(),
                attachment.getCreatedBy()
        );
    }
}