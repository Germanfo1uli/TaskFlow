package com.example.issueservice.dto.rabbit;

import com.example.issueservice.dto.models.Attachment;

import java.time.Instant;

public record AttachmentDeletedEvent(
        long projectId,
        long issueId,
        long attachmentId,
        long deleterId,
        Instant deletedAtUtc
) {
    public static AttachmentDeletedEvent from(Attachment attachment, long projectId) {

        return new AttachmentDeletedEvent(
                projectId,
                attachment.getIssue().getId(),
                attachment.getId(),
                attachment.getCreatedBy(),
                Instant.now()
        );
    }
}
