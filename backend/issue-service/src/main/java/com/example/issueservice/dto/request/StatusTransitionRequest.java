package com.example.issueservice.dto.request;

import com.example.issueservice.dto.models.enums.IssueStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record StatusTransitionRequest(
        @Schema(description = "Статус задачи", example = "CODE_REVIEW")
        @NotNull(message = "Target status is required")
        IssueStatus targetStatus
) {}
