package com.example.issueservice.config;

import com.example.issueservice.client.BoardServiceClient;
import com.example.issueservice.dto.response.UserPermissionsResponse;
import com.example.issueservice.exception.ProjectNotFoundException;
import com.example.issueservice.exception.ServiceUnavailableException;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionCacheReader {
    private final RedisTemplate<String, String> redisTemplate;
    private final BoardServiceClient boardServiceClient;

    public UserPermissionsResponse getUserPermissions(Long userId, Long projectId) {
        String roleKey = String.format("user:%d:project:%d", userId, projectId);
        String roleId = redisTemplate.opsForValue().get(roleKey);

        if (roleId == null) {
            log.warn("Cache miss for user {} in project {}, calling BoardService", userId, projectId);
            return fetchFromBoardService(userId, projectId);
        }

        String permsKey = String.format("role:%s:permissions", roleId);
        Set<String> permissions = redisTemplate.opsForSet().members(permsKey);

        String ownerKey = String.format("role:%s:isOwner", roleId);
        String isOwnerStr = redisTemplate.opsForValue().get(ownerKey);

        if (permissions == null || isOwnerStr == null) {
            log.warn("Partial cache miss for role {}, calling BoardService", roleId);
            return fetchFromBoardService(userId, projectId);
        }

        return new UserPermissionsResponse(
                userId,
                projectId,
                permissions,
                "true".equals(isOwnerStr)
        );
    }

    private UserPermissionsResponse fetchFromBoardService(Long userId, Long projectId) {
        try {
            return boardServiceClient.getUserPermissions(userId, projectId);
        } catch (FeignException.NotFound e) {
            throw new ProjectNotFoundException(projectId);
        } catch (FeignException e) {
            throw new ServiceUnavailableException("Board service error: " + e.getMessage());
        }
    }
}