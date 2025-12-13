package com.example.boardservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record MemberExistResponse (
        @Schema(description = "ID пользователя")
        Long userId,

        @Schema(description = "ID проекта")
        Long projectId
) {}