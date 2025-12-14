package com.example.boardservice.dto.rabbit;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;


@Setter
@Getter
public class ProjectMemberRemovedEvent {
    private long projectId;
    private long removedUserId;
    private long removedByUserId;
    private Instant removedAtUtc = Instant.now();
}