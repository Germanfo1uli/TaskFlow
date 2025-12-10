package com.example.issueservice.dto.models.enums;

public enum ActionType {
    // базовые
    VIEW, CREATE, EDIT, DELETE, ASSIGN, MANAGE,

    // для issue
    TAKE_ISSUE, CREATE_SUBTASK, SUBMIT_FOR_REVIEW,
    TRANSITION_CODE_REVIEW, TRANSITION_QA, FINALIZE_ISSUE,

    // комментарии
    EDIT_OWN, DELETE_OWN,

    // теги
    APPLY,
}