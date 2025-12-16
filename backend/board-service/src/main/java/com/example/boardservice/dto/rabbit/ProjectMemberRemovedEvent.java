package com.example.boardservice.dto.rabbit;

import java.time.Instant;

public record ProjectMemberRemovedEvent (
        long projectId,
        long removedUserId,
        long removedByUserId,
        Instant removedAtUtc
) {
    public static ProjectMemberRemovedEvent from(long projectId, long kickedId, long userId) {

        return new ProjectMemberRemovedEvent(
                projectId,
                kickedId,
                userId,
                Instant.now()
        );
    }
}