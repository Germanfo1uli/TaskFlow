package com.example.boardservice.service;

import com.example.boardservice.cache.RedisCacheService;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.dto.response.UserPermissionsResponse;
import com.example.boardservice.exception.AccessDeniedException;
import com.example.boardservice.exception.ProjectDeletedException;
import com.example.boardservice.exception.ProjectNotFoundException;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRepository;
import com.example.boardservice.repository.ProjectRoleRepository;
import com.example.boardservice.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuthService {
    private final RedisCacheService redisCacheService;
    private final RolePermissionRepository permissionRepository;
    private final ProjectMemberRepository memberRepository;
    private final ProjectRoleRepository roleRepository;
    private final ProjectRepository projectRepository;

    public void checkPermission(Long userId, Long projectId, EntityType entity, ActionType action) {

        checkProjectNotDeleted(projectId);

        Long roleId = redisCacheService.getUserRoleFromCache(userId, projectId);

        log.info("Loading role from Redis: {}", roleId);

        if (roleId == null) {
            roleId = memberRepository.findByUserIdAndProject_Id(userId, projectId)
                    .orElseThrow(() -> new AccessDeniedException("User not in project"))
                    .getRole().getId();
            log.info("Loading role from DB (cache miss): {}", roleId);
            redisCacheService.cacheUserRole(userId, projectId, roleId);
        }

        Set<String> cachedPerms = redisCacheService.getRolePermissionsFromCache(roleId);

        log.info("Loading perms from Redis: {}", cachedPerms);

        if (cachedPerms == null) {
            cachedPerms = permissionRepository.findByRoleId(roleId).stream()
                    .map(p -> p.getEntity().name() + ":" + p.getAction().name())
                    .collect(Collectors.toSet());
            log.info("Loading perms from DB (cache miss): {}", cachedPerms);
            redisCacheService.cacheRolePermissions(roleId, cachedPerms);
        }

        String requiredPermission = entity.name() + ":" + action.name();
        if (!cachedPerms.contains(requiredPermission)) {
            throw new AccessDeniedException(
                    String.format("User %d has no %s permission on %s in project %d",
                            userId, action, entity, projectId)
            );
        }

        log.debug("Access granted: user {} has {} on {} in project {}",
                userId, action, entity, projectId);
    }

    public void checkOwnerOnly(Long userId, Long projectId) {

        checkProjectNotDeleted(projectId);

        if (!isOwner(userId, projectId)) {
            throw new AccessDeniedException("Only project owner can perform this action. User: " + userId);
        }
    }

    private boolean isOwner(Long userId, Long projectId) {
        log.debug("isOwner for userId: {}, projectId: {}", userId, projectId);

        Long roleId = redisCacheService.getUserRoleFromCache(userId, projectId);
        log.debug("RoleId from cache: {}", roleId);

        if (roleId == null) {
            roleId = memberRepository.findRoleIdByUserIdAndProjectId(userId, projectId).orElse(null);
            log.debug("RoleId from DB: {}", roleId);

            if (roleId != null) {
                redisCacheService.cacheUserRole(userId, projectId, roleId);
            } else {
                log.warn("No role found in DB for userId: {}, projectId: {}", userId, projectId);
                return false;
            }
        }

        Boolean isOwner = redisCacheService.getRoleIsOwnerFromCache(roleId);
        log.debug("isOwner from cache for roleId {}: {}", roleId, isOwner);

        if (isOwner != null) {
            return isOwner;
        }

        isOwner = roleRepository.isOwnerRole(roleId);
        log.debug("isOwner from DB for roleId {}: {}", roleId, isOwner);

        redisCacheService.cacheRoleIsOwner(roleId, isOwner);
        return isOwner;
    }

    // internal метод для передачи прав в другой микросервис по запросу
    public UserPermissionsResponse getUserPermissions(Long userId, Long projectId) {
        log.info("Fetching permissions for user {} in project {}", userId, projectId);

        checkProjectNotDeleted(projectId);

        Long roleId = redisCacheService.getUserRoleFromCache(userId, projectId);
        if (roleId == null) {
            roleId = memberRepository.findByUserIdAndProject_Id(userId, projectId)
                    .orElseThrow(() -> new AccessDeniedException("User not in project"))
                    .getRole().getId();
            log.info("Role loaded from DB (cache miss): {}", roleId);
            redisCacheService.cacheUserRole(userId, projectId, roleId);
        } else {
            log.debug("Role loaded from cache: {}", roleId);
        }

        Set<String> permissions = redisCacheService.getRolePermissionsFromCache(roleId);
        if (permissions == null) {
            permissions = permissionRepository.findByRoleId(roleId).stream()
                    .map(p -> p.getEntity().name() + ":" + p.getAction().name())
                    .collect(Collectors.toSet());
            log.info("Permissions loaded from DB (cache miss): {}", permissions);
            redisCacheService.cacheRolePermissions(roleId, permissions);
        } else {
            log.debug("Permissions loaded from cache: {}", permissions);
        }

        Boolean isOwner = redisCacheService.getRoleIsOwnerFromCache(roleId);
        if (isOwner == null) {
            isOwner = roleRepository.isOwnerRole(roleId);
            log.debug("isOwner loaded from DB (cache miss): {}", isOwner);
            redisCacheService.cacheRoleIsOwner(roleId, isOwner);
        } else {
            log.debug("isOwner loaded from cache: {}", isOwner);
        }

        return new UserPermissionsResponse(userId, projectId, permissions, isOwner);
    }

    private void checkProjectNotDeleted(Long projectId) {
        Boolean isDeleted = projectRepository.isDeleted(projectId);
        if (isDeleted == null || isDeleted) {
            if (isDeleted == null) {
                throw new ProjectNotFoundException(projectId);
            }
            throw new ProjectDeletedException("Project with ID " + projectId + " has been deleted");
        }
    }

    public boolean hasPermission(Long userId, Long projectId, EntityType entity, ActionType action) {
        try {
            checkPermission(userId, projectId, entity, action);
            return true;
        } catch (AccessDeniedException e) {
            throw new AccessDeniedException(e.getMessage());
        }
    }
}
