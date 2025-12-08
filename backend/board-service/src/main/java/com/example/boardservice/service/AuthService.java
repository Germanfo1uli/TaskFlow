package com.example.boardservice.service;

import com.example.boardservice.cache.RedisCacheService;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.exception.AccessDeniedException;
import com.example.boardservice.repository.ProjectMemberRepository;
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

    public void checkPermission(Long userId, Long projectId, EntityType entity, ActionType action) {
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
        if (!isOwner(userId, projectId)) {
            throw new AccessDeniedException("Only project owner can perform this action. User: " + userId);
        }
    }

    private boolean isOwner(Long userId, Long projectId) {
        Long roleId = redisCacheService.getUserRoleFromCache(userId, projectId);

        if (roleId == null) {
            roleId = memberRepository.findRoleIdByUserIdAndProjectId(userId, projectId)
                    .orElse(null);
            if (roleId != null) {
                redisCacheService.cacheUserRole(userId, projectId, roleId);
            } else {
                return false;
            }
        }

        Boolean isOwner = redisCacheService.getRoleIsOwnerFromCache(roleId);
        if (isOwner != null) {
            return isOwner;
        }

        isOwner = roleRepository.isOwnerRole(roleId);
        redisCacheService.cacheRoleIsOwner(roleId, isOwner);
        return isOwner;
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
