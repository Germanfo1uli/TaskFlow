package com.example.boardservice.service;

import com.example.boardservice.config.PermissionMatrixProperties;
import com.example.boardservice.dto.data.PermissionEntry;
import com.example.boardservice.dto.models.RolePermission;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionMatrixService {
    private final PermissionMatrixProperties matrixProps;

    public void validatePermission(EntityType entity, ActionType action) {
        if (!matrixProps.isAllowed(entity, action)) {
            throw new IllegalArgumentException(
                    String.format("Permission %s:%s is not allowed by matrix", entity, action)
            );
        }
    }

    public void validatePermissions(Set<PermissionEntry> permissions) {
        permissions.forEach(entry -> validatePermission(entry.getEntity(), entry.getAction()));
    }

    public Set<String> toCacheFormat(Set<RolePermission> permissions) {
        return permissions.stream()
                .map(p -> p.getEntity().name() + ":" + p.getAction().name())
                .collect(Collectors.toSet());
    }

    public Set<ActionType> getAllowedActions(EntityType entity) {
        return matrixProps.getAllowedActions(entity);
    }
}