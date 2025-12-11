package com.example.issueservice.dto.response;

import java.util.Set;

public record UserPermissionsResponse(
        Long userId,
        Long projectId,
        Set<String> permissions,
        boolean isOwner
) {}
