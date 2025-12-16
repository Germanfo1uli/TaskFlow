package com.example.boardservice.dto.rabbit;

import com.example.boardservice.dto.models.Project;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public record ProjectCreatedEvent (
        long projectId,
        String projectName,
        long creatorId,
        Instant createdAtUtc
) {
    public static ProjectCreatedEvent fromProject(Project project, long ownerId) {

        LocalDateTime projectCreatedAt = project.getCreatedAt();

        Instant createdAtInstant = (projectCreatedAt != null)
                ? projectCreatedAt.atZone(ZoneId.of("UTC")).toInstant()
                : Instant.now();

        return new ProjectCreatedEvent(
                project.getId(),
                project.getName(),
                ownerId,
                createdAtInstant
        );
    }
}