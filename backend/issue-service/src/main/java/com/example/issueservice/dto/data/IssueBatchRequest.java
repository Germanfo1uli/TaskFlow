package com.example.issueservice.dto.data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record IssueBatchRequest (
        Long userId,
        @NotNull @Size(min = 1, max = 100)
        List<@NotNull Long> issuesIds
) {}
