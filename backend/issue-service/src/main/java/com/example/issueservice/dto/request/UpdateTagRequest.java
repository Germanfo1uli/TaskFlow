package com.example.issueservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdateTagRequest(
        @Schema(description = "Название тега", example = "Machine Learning")
        @NotNull(message = "Name is required")
        String name
) {}
