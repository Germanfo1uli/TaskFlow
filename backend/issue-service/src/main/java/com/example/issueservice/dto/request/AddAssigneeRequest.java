package com.example.issueservice.dto.request;

import com.example.issueservice.dto.models.enums.AssignmentType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record AddAssigneeRequest(
        @Schema(description = "ID участника проекта", example = "123")
        @NotNull
        Long userId,

        @Schema(description = "Тип назначаемого пользователя", example = "ASSIGNEE")
        @NotNull
        AssignmentType type
) {}
