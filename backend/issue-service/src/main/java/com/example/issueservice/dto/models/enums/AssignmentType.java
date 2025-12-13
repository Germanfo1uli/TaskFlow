package com.example.issueservice.dto.models.enums;

import lombok.Getter;

@Getter
public enum AssignmentType {
    ASSIGNEE(ActionType.TAKE_ISSUE),
    CODE_REVIEWER(ActionType.TRANSITION_CODE_REVIEW),
    QA_ENGINEER(ActionType.TRANSITION_QA);

    private final ActionType actionType;

    AssignmentType(ActionType actionType) {
        this.actionType = actionType;
    }

}