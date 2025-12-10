package com.example.issueservice.config;

import com.example.issueservice.client.BoardServiceClient;
import com.example.issueservice.dto.response.UserPermissionsResponse;
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
        String roleKey = String.format("user:role:%d:%d", userId, projectId);

        String roleId = redisTemplate.opsForValue().get(roleKey);

        if (roleId == null) {
            log.warn("Cache miss for user {} in project {}, calling BoardService", userId, projectId);
            return boardServiceClient.getUserPermissions(userId, projectId);
        }

        String permsKey = String.format("role:perms:%s", roleId);
        Set<String> permissions = redisTemplate.opsForSet().members(permsKey);

        String ownerKey = String.format("role:owner:%s", roleId);
        String isOwnerStr = redisTemplate.opsForValue().get(ownerKey);

        return new UserPermissionsResponse(
                userId,
                projectId,
                permissions != null ? permissions : Set.of(),
                "true".equals(isOwnerStr)
        );
    }
}