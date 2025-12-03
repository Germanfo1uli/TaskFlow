package com.example.boardservice.config;

import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@ConfigurationProperties(prefix = "permissions")
public class PermissionMatrixProperties {
    private Map<String, List<String>> matrix = new java.util.HashMap<>();

    public Map<String, List<String>> getMatrix() {
        return matrix;
    }

    public void setMatrix(Map<String, List<String>> matrix) {
        this.matrix = matrix;
    }

    public boolean isAllowed(EntityType entity, ActionType action) {
        return Optional.ofNullable(matrix.get(entity.name()))
                .map(actions -> actions.contains(action.name()))
                .orElse(false);
    }

    public Set<ActionType> getAllowedActions(EntityType entity) {
        return Optional.ofNullable(matrix.get(entity.name()))
                .map(actions -> actions.stream()
                        .map(ActionType::valueOf)
                        .collect(Collectors.toSet()))
                .orElse(Set.of());
    }

    public Map<String, List<String>> getAllowedCombinations() {
        return matrix;
    }
}