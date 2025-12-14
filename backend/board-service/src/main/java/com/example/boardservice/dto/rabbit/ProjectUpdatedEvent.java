package com.example.boardservice.dto.rabbit;

import com.example.boardservice.dto.models.Project;

import java.time.Instant;

public record ProjectUpdatedEvent (
        long projectId,
        long updaterId,
        Instant updatedAtUtc
) {
    public static ProjectUpdatedEvent fromProject(Project project, long updatedBy) {

        return new ProjectUpdatedEvent(
                project.getId(),
                updatedBy,
                Instant.now()
        );
    }
}