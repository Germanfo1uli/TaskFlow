package com.example.boardservice.service;

import com.example.boardservice.config.PermissionMatrixProperties;
import com.example.boardservice.dto.models.RolePermission;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.repository.ProjectRoleRepository;
import com.example.boardservice.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final ProjectRoleRepository roleRepository;
    private final RolePermissionRepository permissionRepository;
    private final PermissionMatrixProperties matrixProps;

    @Transactional
    public ProjectRole createDefaultRoles(Long projectId) {
        ProjectRole owner = ProjectRole.builder()
                .project(Project.builder().id(projectId).build())
                .name("Owner")
                .isOwner(true)
                .isDefault(false)
                .build();

        ProjectRole user = ProjectRole.builder()
                .project(Project.builder().id(projectId).build())
                .name("User")
                .isOwner(false)
                .isDefault(true)
                .build();

        roleRepository.saveAll(List.of(owner, user));

        Set<RolePermission> ownerPerms = Arrays.stream(EntityType.values())
                .flatMap(entity -> matrixProps.getAllowedActions(entity).stream()
                        .map(action -> RolePermission.builder()
                                .role(owner)
                                .entity(entity)
                                .action(action)
                                .build()))
                .collect(Collectors.toSet());

        Set<RolePermission> userPerms = Arrays.stream(EntityType.values())
                .map(entity -> RolePermission.builder()
                        .role(user)
                        .entity(entity)
                        .action(ActionType.VIEW)
                        .build())
                .collect(Collectors.toSet());

        permissionRepository.saveAll(ownerPerms);
        permissionRepository.saveAll(userPerms);

        owner.setPermissions(ownerPerms);
        user.setPermissions(userPerms);

        return owner;
    }

    @Transactional
    public void addPermission(Long roleId, EntityType entity, ActionType action) {
        ProjectRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        if (!matrixProps.isAllowed(entity, action)) {
            throw new IllegalArgumentException("Invalid permission: " + entity + "+" + action);
        }

        RolePermission permission = RolePermission.builder()
                .role(role)
                .entity(entity)
                .action(action)
                .build();

        permissionRepository.save(permission);
        role.getPermissions().add(permission);
    }
}