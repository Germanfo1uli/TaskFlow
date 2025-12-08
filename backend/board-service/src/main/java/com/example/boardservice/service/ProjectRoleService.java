package com.example.boardservice.service;

import com.example.boardservice.cache.RedisCacheService;
import com.example.boardservice.dto.data.PermissionEntry;
import com.example.boardservice.dto.models.ProjectMember;
import com.example.boardservice.dto.models.RolePermission;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.dto.response.GetRolesResponse;
import com.example.boardservice.dto.response.RoleResponse;
import com.example.boardservice.exception.RoleNotFoundException;
import com.example.boardservice.exception.UserNotFoundException;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRoleRepository;
import com.example.boardservice.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectRoleService {
    private final ProjectRoleRepository roleRepository;
    private final RolePermissionRepository permissionRepository;
    private final ProjectMemberRepository memberRepository;
    private final PermissionMatrixService permissionMatrixService;
    private final AuthService authService;
    private final RedisCacheService redisCacheService;

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
                .flatMap(entity -> permissionMatrixService.getAllowedActions(entity).stream()
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

        cachePermissions(owner.getId(), ownerPerms, owner.getIsOwner());
        cachePermissions(user.getId(), userPerms, user.getIsOwner());

        log.info("Created default roles for project {}: Owner(ID:{}) and User(ID:{})",
                projectId, owner.getId(), user.getId());

        return owner;
    }

    @Transactional
    public RoleResponse createRole(Long userId, Long projectId, boolean isDefault, String roleName, Set<PermissionEntry> request) {

        authService.checkOwnerOnly(userId, projectId);

        if (roleName == null || roleName.isBlank()) {
            throw new IllegalArgumentException("Role name is required");
        }

        permissionMatrixService.validatePermissions(request);

        ProjectRole role = ProjectRole.builder()
                .project(Project.builder().id(projectId).build())
                .name(roleName)
                .isDefault(isDefault)
                .isOwner(false)
                .build();

        role = roleRepository.save(role);

        Set<RolePermission> permissions = createPermissions(role, request);
        permissionRepository.saveAll(permissions);

        cachePermissions(role.getId(), permissions, role.getIsOwner());

        log.info("User {} created role '{}' (ID:{}) in project {}", userId, roleName, role.getId(), projectId);

        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getIsOwner(),
                role.getIsDefault(),
                request
        );
    }

    @Transactional
    public RoleResponse updateRole(Long userId, Long roleId, Long projectId, boolean isDefault, String roleName, Set<PermissionEntry> request) {

        authService.checkOwnerOnly(userId, projectId);

        ProjectRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role ID: " + roleId + " not found"));

        if (!Objects.equals(role.getProject().getId(), projectId)) {
            throw new IllegalArgumentException("Role " + roleId + " does not belong to project " + projectId);
        }

        if (roleName != null && !roleName.isBlank()) {
            role.setName(roleName);
        }

        role.setIsDefault(isDefault);
        permissionMatrixService.validatePermissions(request);

        redisCacheService.invalidateRolePermissions(roleId);
        permissionRepository.deleteByRoleId(roleId);

        Set<RolePermission> permissions = createPermissions(role, request);
        permissionRepository.saveAll(permissions);
        role.setPermissions(permissions);

        invalidateUserCaches(roleId);

        cachePermissions(role.getId(), permissions, role.getIsOwner());

        log.info("User {} updated role '{}' (ID:{}) in project {}", userId, role.getName(), roleId, projectId);

        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getIsOwner(),
                role.getIsDefault(),
                request
        );
    }

    @Transactional
    public void deleteRole(Long userId, Long roleId, Long projectId) {

        authService.checkOwnerOnly(userId, projectId);

        ProjectRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role ID: " + roleId + " not found"));

        if (!Objects.equals(role.getProject().getId(), projectId)) {
            throw new IllegalArgumentException("Role " + roleId + " does not belong to project " + projectId);
        }

        List<ProjectMember> affectedMembers = memberRepository.findAllByRole_IdAndProject_Id(roleId, projectId);
        ProjectRole defaultRole = roleRepository.findByProject_IdAndIsDefaultTrue(projectId)
                .orElseThrow(() -> new IllegalStateException("No default role in project " + projectId));

        log.info("User {} deleting role {} in project {}, reassigning {} members to default role {}",
                userId, roleId, projectId, affectedMembers.size(), defaultRole.getId());

        if (!affectedMembers.isEmpty()) {
            affectedMembers.forEach(member -> member.setRole(defaultRole));
            memberRepository.saveAll(affectedMembers);
        }

        permissionRepository.deleteByRoleId(roleId);
        roleRepository.delete(role);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        redisCacheService.invalidateRolePermissions(roleId);

                        affectedMembers.forEach(member ->
                                redisCacheService.invalidateUserRole(member.getUserId(), projectId)
                        );

                        log.info("Role {} deleted, caches invalidated for {} members", roleId, affectedMembers.size());
                    }
                }
        );
    }

    @Transactional
    public void assignRole(Long userId, Long projectId, Long assignedId, Long roleId) {

        authService.checkOwnerOnly(userId, projectId);

        ProjectRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role ID: " + roleId + " not found"));

        if (!Objects.equals(role.getProject().getId(), projectId)) {
            throw new IllegalArgumentException("Role " + roleId + " does not belong to project " + projectId);
        }

        ProjectMember member = memberRepository.findByUserIdAndProject_Id(assignedId, projectId)
                .orElseThrow(() -> new UserNotFoundException("User with Id: " + assignedId + " not found in project with Id: " + projectId));

        member.setRole(role);
        memberRepository.save(member);

        redisCacheService.invalidateUserRole(userId, projectId);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        redisCacheService.invalidateRolePermissions(roleId);

                        redisCacheService.invalidateUserRole(member.getUserId(), projectId);

                        log.info("Role {} deleted, caches invalidated for 1 members", roleId);
                    }
                }
        );
    }

    @Transactional(readOnly = true)
    public GetRolesResponse getRolesByProjectId(Long userId, Long projectId) {

        authService.checkPermission(userId, projectId, EntityType.PROJECT, ActionType.VIEW);

        List<ProjectRole> roles = roleRepository.findByProject_IdWithPermissions(projectId);

        return GetRolesResponse.fromEntities(projectId, roles);
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

    private void cachePermissions(Long roleId, Set<RolePermission> permissions, boolean isOwner) {
        Set<String> permStrings = permissionMatrixService.toCacheFormat(permissions);
        redisCacheService.cacheRolePermissions(roleId, permStrings);
        redisCacheService.cacheRoleIsOwner(roleId, isOwner);
    }

    private void invalidateUserCaches(Long roleId) {
        List<ProjectMember> members = memberRepository.findAllByRoleId(roleId);
        if (members.isEmpty()) return;

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        members.forEach(member ->
                                redisCacheService.invalidateUserRole(member.getUserId(), member.getProject().getId())
                        );
                        log.debug("Invalidated user-role caches for {} members with role {}",
                                members.size(), roleId);
                    }
                }
        );
    }
}