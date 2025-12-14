package com.example.boardservice.dto.rabbit;

import com.example.boardservice.dto.models.ProjectMember;

import java.time.Instant;

public record ProjectMemberRemovedEvent (
        long projectId,
        long removedUserId,
        long removedByUserId,
        Instant removedAtUtc
) {
    public static ProjectMemberRemovedEvent fromProject(ProjectMember member, long addedBy) {

        return new ProjectMemberRemovedEvent(
                member.getProject().getId(),
                member.getUserId(),
                addedBy,
                Instant.now()
        );
    }
}