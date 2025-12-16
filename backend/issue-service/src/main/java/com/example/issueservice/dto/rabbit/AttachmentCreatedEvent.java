package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Attachment;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public record AttachmentCreatedEvent(
        long projectId,
        long issueId,
        long attachmentId,
        long uploaderId,
        Instant createdAtUtc
) {
    public static AttachmentCreatedEvent from(Attachment attachment, long projectId) {

        LocalDateTime attachmentCreatedAt = attachment.getCreatedAt();

        Instant createdAtInstant = (attachmentCreatedAt != null)
                ? attachmentCreatedAt.atZone(ZoneId.of("UTC")).toInstant()
                : Instant.now();

        return new AttachmentCreatedEvent(
                projectId,
                attachment.getIssue().getId(),
                attachment.getId(),
                attachment.getCreatedBy(),
                createdAtInstant
        );
    }
}
