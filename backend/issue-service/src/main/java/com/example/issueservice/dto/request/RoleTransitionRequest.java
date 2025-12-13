package com.example.issueservice.dto.request;

import com.example.issueservice.dto.models.enums.AssignmentType;
import com.example.issueservice.dto.models.enums.IssueStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record RoleTransitionRequest(
        @Schema(description = "Тип назначаемого пользователя", example = "ASSIGNEE")
        @NotNull(message = "Assignment type is required")
        AssignmentType type,

        @Schema(description = "Статус задачи", example = "CODE_REVIEW")
        @NotNull(message = "Target status is required")
        IssueStatus targetStatus
) {}