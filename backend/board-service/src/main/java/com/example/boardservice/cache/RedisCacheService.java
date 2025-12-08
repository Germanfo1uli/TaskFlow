package com.example.boardservice.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisCacheService {
    private final RedisTemplate<String, String> redisTemplate;

    public void cacheUserRole(Long userId, Long projectId, Long roleId) {
        String key = String.format(RedisConstants.USER_ROLE_KEY, userId, projectId);
        redisTemplate.opsForValue().set(key, roleId.toString(), RedisConstants.USER_ROLE_TTL);
        log.info("Cached role {} for user {} in project {}", roleId, userId, projectId);
    }

    public Long getUserRoleFromCache(Long userId, Long projectId) {
        String key = String.format(RedisConstants.USER_ROLE_KEY, userId, projectId);
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? Long.parseLong(value) : null;
    }

    public void invalidateUserRole(Long userId, Long projectId) {
        String key = String.format(RedisConstants.USER_ROLE_KEY, userId, projectId);
        redisTemplate.delete(key);
        log.info("Invalidated role cache for user {} in project {}", userId, projectId);
    }

    public void invalidateAllUsersInProject(Long projectId) {
        String pattern = String.format("user:*:project:%d", projectId);
        Set<String> keysToDelete = new HashSet<>();

        ScanOptions options = ScanOptions.scanOptions()
                .match(pattern)
                .count(100)
                .build();

        try (Cursor<byte[]> cursor = redisTemplate.getConnectionFactory()
                .getConnection()
                .scan(options)) {

            while (cursor.hasNext()) {
                keysToDelete.add(new String(cursor.next()));
            }
        } catch (Exception e) {
            log.error("Error scanning Redis keys for pattern {}", pattern, e);
        }

        if (!keysToDelete.isEmpty()) {
            redisTemplate.delete(keysToDelete);
            log.info("Invalidated {} user-role caches for project {}", keysToDelete.size(), projectId);
        }
    }

    public void cacheRolePermissions(Long roleId, Set<String> permissions) {
        String key = String.format(RedisConstants.ROLE_PERMS_KEY, roleId);
        redisTemplate.delete(key);
        redisTemplate.opsForSet().add(key, permissions.toArray(new String[0]));
        redisTemplate.expire(key, RedisConstants.ROLE_PERMS_TTL);
        log.debug("Cached {} permissions for role {}", permissions.size(), roleId);
    }

    public Set<String> getRolePermissionsFromCache(Long roleId) {
        String key = String.format(RedisConstants.ROLE_PERMS_KEY, roleId);

        if (!redisTemplate.hasKey(key)) {
            return null;
        }

        return redisTemplate.opsForSet().members(key);
    }

    public void invalidateRolePermissions(Long roleId) {
        String key = String.format(RedisConstants.ROLE_PERMS_KEY, roleId);
        redisTemplate.delete(key);
        log.debug("Invalidated permissions cache for role {}", roleId);
    }

    public void cacheRoleIsOwner(Long roleId, boolean isOwner) {
        String key = String.format(RedisConstants.ROLE_IS_OWNER_KEY, roleId);
        redisTemplate.opsForValue().set(key, String.valueOf(isOwner), RedisConstants.ROLE_IS_OWNER_TTL);
    }

    public Boolean getRoleIsOwnerFromCache(Long roleId) {
        String key = String.format(RedisConstants.ROLE_IS_OWNER_KEY, roleId);
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? Boolean.parseBoolean(value) : null;
    }

    public void invalidateRoleIsOwner(Long roleId) {
        String key = String.format(RedisConstants.ROLE_IS_OWNER_KEY, roleId);
        redisTemplate.delete(key);
    }
}