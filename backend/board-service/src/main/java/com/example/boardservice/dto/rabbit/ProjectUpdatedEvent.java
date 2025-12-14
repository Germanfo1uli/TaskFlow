package com.example.boardservice.dto.rabbit;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
public class ProjectUpdatedEvent {
    private long projectId;
    private long updaterId;
    private Instant updatedAtUtc = Instant.now();
}