package com.example.boardservice.service;

import com.example.boardservice.cache.RedisCacheService;
import com.example.boardservice.client.UserServiceClient;
import com.example.boardservice.dto.data.PermissionEntry;
import com.example.boardservice.dto.models.ProjectMember;
import com.example.boardservice.dto.models.RolePermission;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.dto.response.GetRolesResponse;
import com.example.boardservice.dto.response.RoleResponse;
import com.example.boardservice.exception.*;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRoleRepository;
import com.example.boardservice.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.*;
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
    private final UserServiceClient userServiceClient;
    private final RolePermissionFactory permissionFactory;

    @Transactional // при создании проекта генерируются 5 базовых ролей
    public ProjectRole createDefaultRoles(Long projectId) {
        List<ProjectRole> roles = List.of(
                roleBuilder(projectId, "Owner", false, true),
                roleBuilder(projectId, "User", true, false),
                roleBuilder(projectId, "Developer", false, false),
                roleBuilder(projectId, "Code Reviewer", false, false),
                roleBuilder(projectId, "QA Engineer", false, false)
        );
        roleRepository.saveAll(roles);

        for (ProjectRole role : roles) {
            Set<RolePermission> rolePermissions = permissionFactory.createPermissions(role);

            role.getPermissions().addAll(rolePermissions);

            roleRepository.save(role);

            log.debug("Saved {} permissions for role '{}'", rolePermissions.size(), role.getName());
        }

        log.info("Created {} default roles for project {}", roles.size(), projectId);
        return roles.getFirst();
    }

    private ProjectRole roleBuilder(Long projectId, String name, boolean isDefault, boolean isOwner) {
        return ProjectRole.builder()
                .project(Project.builder().id(projectId).build())
                .name(name)
                .isDefault(isDefault)
                .isOwner(isOwner)
                .build();
    }

    @Transactional
    public RoleResponse createRole(Long userId, Long projectId, String roleName, Set<PermissionEntry> request) {

        authService.checkOwnerOnly(userId, projectId);

        if (roleName == null || roleName.isBlank()) {
            throw new InvalidRoleNameException("Role name is required and cannot be blank");
        }

        permissionMatrixService.validatePermissions(request);

        ProjectRole role = ProjectRole.builder()
                .project(Project.builder().id(projectId).build())
                .name(roleName)
                .isDefault(false)
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
    public RoleResponse updateRole(Long userId, Long roleId, Long projectId, String roleName, Set<PermissionEntry> request) {

        authService.checkOwnerOnly(userId, projectId);

        ProjectRole role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role ID: " + roleId + " not found"));

        if (!Objects.equals(role.getProject().getId(), projectId)) {
            throw new RoleNotInProjectException("Role " + roleId + " does not belong to project " + projectId);
        }

        if (roleName != null && !roleName.isBlank()) {
            role.setName(roleName);
        }

        permissionMatrixService.validatePermissions(request);

        Set<RolePermission> newPermissions = createPermissions(role, request);
        role.getPermissions().clear();
        role.getPermissions().addAll(newPermissions);

        roleRepository.saveAndFlush(role);

        invalidateUserCaches(roleId);

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
            throw new RoleNotInProjectException("Role " + roleId + " does not belong to project " + projectId);
        }

        List<ProjectMember> affectedMembers = memberRepository.findAllByRole_IdAndProject_Id(roleId, projectId);
        ProjectRole defaultRole = roleRepository.findByProject_IdAndIsDefaultTrue(projectId)
                .orElseThrow(() -> new MissingDefaultRoleException("No default role in project " + projectId));

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
                        try {
                            redisCacheService.invalidateAllUsersInProject(projectId);

                            log.info("Role {} deleted, caches invalidated for {} members", roleId, affectedMembers.size());
                        } catch (Exception e) {
                            log.error("Failed to invalidate cache for role {} in project {}: {}",
                                    roleId, projectId, e.getMessage());
                        }
                    }
                }
        );
    }

    @Transactional
    public void assignRole(Long userId, Long projectId, Long assignedId, Long roleId) {

        authService.checkOwnerOnly(userId, projectId);

        try {
            userServiceClient.getProfileById(assignedId);
        } catch (Exception e) {
            throw new UserNotFoundException("User with Id: " + assignedId + " does not exist");
        }

        ProjectRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role ID: " + roleId + " not found"));

        if (!Objects.equals(role.getProject().getId(), projectId)) {
            throw new RoleNotInProjectException("Role " + roleId + " does not belong to project " + projectId);
        }

        ProjectMember member = memberRepository.findByUserIdAndProject_Id(assignedId, projectId)
                .orElseThrow(() -> new UserNotFoundException("User with Id: " + assignedId + " not found in project with Id: " + projectId));

        member.setRole(role);
        memberRepository.save(member);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            redisCacheService.invalidateUserRole(member.getUserId(), projectId);

                            log.info("Role {} deleted, caches invalidated for 1 members", roleId);
                        } catch (Exception e) {
                            log.error("Failed to invalidate cache for user {} in project {}: {}",
                                    member.getUserId(), projectId, e.getMessage());
                        }
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

    @Transactional(readOnly = true)
    public RoleResponse getOwnRoleByProjectId(Long userId, Long projectId) {

        ProjectRole role = roleRepository.findByUserIdAndProjectId(userId, projectId)
                .orElseThrow(() -> new AccessDeniedException("You are not exist in this project"));

        return RoleResponse.fromEntity(role);
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
        redisCacheService.invalidateRolePermissions(roleId);

        List<ProjectMember> members = memberRepository.findAllByRoleId(roleId);
        if (members.isEmpty()) return;

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            members.forEach(member ->
                                    redisCacheService.invalidateUserRole(member.getUserId(), member.getProject().getId())
                            );
                            log.debug("Invalidated user-role caches for {} members with role {}",
                                    members.size(), roleId);
                        } catch (Exception e) {
                            log.error("Failed to invalidate cache for role {}: {}",
                                    roleId, e.getMessage());
                        }

                    }
                }
        );
    }
}