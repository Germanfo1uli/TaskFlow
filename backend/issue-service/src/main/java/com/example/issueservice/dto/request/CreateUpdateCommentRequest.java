package com.example.issueservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record CreateUpdateCommentRequest(
        @Schema(description = "Комментарий к задаче", example = "Классно, но переделывай")
        @NotNull(message = "Message is required")
        String message
) {}
