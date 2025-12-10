package com.example.boardservice.dto.response;

import java.util.Set;

public record UserPermissionsResponse(
        Long userId,
        Long projectId,
        Set<String> permissions,
        boolean isOwner
) {}
