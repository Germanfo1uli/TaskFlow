package com.example.boardservice.dto.rabbit;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
public class ProjectMemberAddedEvent {
    private long projectId;
    private long addedUserId;
    private long addedByUserId;
    private Instant addedAtUtc = Instant.now();
}