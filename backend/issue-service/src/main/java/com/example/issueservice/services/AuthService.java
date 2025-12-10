package com.example.issueservice.services;

import com.example.issueservice.config.PermissionCacheReader;
import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.EntityType;
import com.example.issueservice.dto.response.UserPermissionsResponse;
import com.example.issueservice.exception.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final PermissionCacheReader cacheReader;

    public void hasPermission(Long userId, Long projectId, EntityType entity, ActionType action) {
        UserPermissionsResponse perms = cacheReader.getUserPermissions(userId, projectId);
        if(perms.permissions().contains(entity.name() + ":" + action.name())) {
            throw new AccessDeniedException("User has no permission to view issues");
        }
    }

    public UserPermissionsResponse getUserPermissions(Long userId, Long projectId) {
        return cacheReader.getUserPermissions(userId, projectId);
    }
}