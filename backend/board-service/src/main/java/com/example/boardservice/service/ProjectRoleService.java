package com.example.boardservice.service;

import com.example.boardservice.config.PermissionMatrixProperties;
import com.example.boardservice.dto.data.PermissionEntry;
import com.example.boardservice.dto.models.RolePermission;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.exception.RoleNotFoundException;
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
public class ProjectRoleService {
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
    public ProjectRole createRole(Long projectId, boolean isDefault, String roleName, Set<PermissionEntry> request) {
        if (roleName == null || roleName.isBlank()) {
            throw new IllegalArgumentException("Role name is required");
        }

        validatePermissions(request);

        ProjectRole role = ProjectRole.builder()
                .project(Project.builder().id(projectId).build())
                .name(roleName)
                .isDefault(isDefault)
                .build();

        role = roleRepository.save(role);

        Set<RolePermission> permissions = createPermissions(role, request);
        permissionRepository.saveAll(permissions);

        role.setPermissions(permissions);

        return role;
    }

    @Transactional
    public ProjectRole updateRole(Long roleId, Long projectId, boolean isDefault, String roleName, Set<PermissionEntry> request) {

        ProjectRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role with ID: " + roleId + "not found"));

        if (roleName != null && !roleName.isBlank()) {
            role.setName(roleName);
        }

        role.setIsDefault(isDefault);
        validatePermissions(request);
        permissionRepository.deleteByRoleId(roleId);

        Set<RolePermission> permissions = createPermissions(role, request);
        permissionRepository.saveAll(permissions);

        role.setPermissions(permissions);

        return role;
    }

    @Transactional(readOnly = true)
    public List<ProjectRole> getRolesByProjectId(Long projectId) {
        return roleRepository.findByProject_Id(projectId);
    }

    private void validatePermissions(Set<PermissionEntry> permissions) {
        for (PermissionEntry entry : permissions) {
            if (!matrixProps.isAllowed(entry.getEntity(), entry.getAction())) {
                throw new IllegalArgumentException(
                        "Invalid permission: " + entry.getEntity() + "+" + entry.getAction()
                );
            }
        }
    }

    private Set<RolePermission> createPermissions(ProjectRole role, Set<PermissionEntry> entries) {
        return entries.stream()
                .map(entry -> RolePermission.builder()
                        .role(role)
                        .entity(entry.getEntity())
                        .action(entry.getAction())
                        .build())
                .collect(Collectors.toSet());
    }
}