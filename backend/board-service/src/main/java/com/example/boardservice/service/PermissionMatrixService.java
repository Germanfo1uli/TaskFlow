package com.example.boardservice.service;

import com.example.boardservice.config.PermissionMatrixProperties;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionMatrixService {
    private final PermissionMatrixProperties properties;

    public void validate(EntityType entity, ActionType action) {
        if (!properties.isAllowed(entity, action)) {
            throw new IllegalArgumentException(
                    String.format("Invalid combination: %s + %s", entity, action)
            );
        }
    }

    public java.util.Set<ActionType> getAllowedActions(EntityType entity) {
        return properties.getAllowedActions(entity);
    }

    public java.util.Map<String, java.util.List<String>> getMatrix() {
        return properties.getAllowedCombinations();
    }
}