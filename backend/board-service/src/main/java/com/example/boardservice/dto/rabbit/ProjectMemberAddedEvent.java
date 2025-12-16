package com.example.boardservice.dto.rabbit;

import com.example.boardservice.dto.models.ProjectMember;

import java.time.Instant;

public record ProjectMemberAddedEvent(
        long projectId,
        long addedUserId,
        long addedByUserId,
        Instant addedAtUtc
) {
    public static ProjectMemberAddedEvent fromMember(ProjectMember member, long addedBy) {

        return new ProjectMemberAddedEvent(
                member.getProject().getId(),
                member.getUserId(),
                addedBy,
                Instant.now()
        );
    }
}