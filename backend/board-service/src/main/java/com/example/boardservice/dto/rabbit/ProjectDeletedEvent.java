package com.example.boardservice.dto.rabbit;

import com.example.boardservice.dto.models.Project;

import java.time.Instant;

public record ProjectDeletedEvent (
        long projectId,
        long deleterId,
        Instant deletedAtUtc
) {
    public static ProjectDeletedEvent fromProject(Project project) {

        return new ProjectDeletedEvent(
                project.getId(),
                project.getOwnerId(),
                Instant.now()
        );
    }
}