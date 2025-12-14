package com.example.boardservice.dto.rabbit;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
public class ProjectDeletedEvent {
    private long projectId;
    private long deleterId;
    private Instant deletedAtUtc = Instant.now();
}