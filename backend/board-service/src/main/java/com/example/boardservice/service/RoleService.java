package com.example.boardservice.service;

import com.example.boardservice.config.PermissionMatrixProperties;
import com.example.boardservice.dto.models.PermissionEntry;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.repository.ProjectRoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final ProjectRoleRepository roleRepository;
    private final PermissionMatrixProperties matrixProps;

    @Transactional // создание ролей по умолчанию (owner - все права, и user - имеет только view)
    public void createDefaultRoles(Long projectId) {
        Project project = Project.builder().id(projectId).build();

        Set<PermissionEntry> ownerPerms = Arrays.stream(EntityType.values())
                .flatMap(e -> matrixProps.getAllowedActions(e).stream()
                        .map(a -> new PermissionEntry(e, a)))
                .collect(Collectors.toSet());

        ProjectRole owner = ProjectRole.builder()
                .project(project)
                .name("Owner")
                .isOwner(true)
                .isDefault(false)
                .permissions(ownerPerms)
                .build();

        Set<PermissionEntry> userPerms = Arrays.stream(EntityType.values())
                .map(e -> new PermissionEntry(e, ActionType.VIEW))
                .collect(Collectors.toSet());

        ProjectRole user = ProjectRole.builder()
                .project(project)
                .name("User")
                .isOwner(false)
                .isDefault(true)
                .permissions(userPerms)
                .build();

        roleRepository.saveAll(List.of(owner, user));
    }

    @Transactional
    public void addPermission(Long roleId, EntityType entity, ActionType action) {
        ProjectRole role = roleRepository.findById(roleId).orElseThrow();

        if (!matrixProps.isAllowed(entity, action)) {
            throw new IllegalArgumentException("Invalid combo: " + entity + "+" + action);
        }

        role.getPermissions().add(new PermissionEntry(entity, action));
    }
}
