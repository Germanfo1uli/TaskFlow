package com.example.boardservice.dto.rabbit;

import lombok.Getter;

@Getter
public enum EventRoutingKey {
    PROJECT_CREATED("project.created"),
    PROJECT_UPDATED("project.updated"),
    PROJECT_DELETED("project.deleted"),
    PROJECT_MEMBER_ADDED("project.member.added"),
    PROJECT_MEMBER_REMOVED("project.member.removed");

    private final String value;

    EventRoutingKey(String value) {
        this.value = value;
    }
}