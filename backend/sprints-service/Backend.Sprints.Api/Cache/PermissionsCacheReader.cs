using Backend.Sprints.Api.Clients;
using Microsoft.Extensions.Caching.Distributed;
using Refit;
using StackExchange.Redis;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Cache
{
    public class PermissionCacheReader
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IProjectClient _permissionClient;
        private readonly ILogger<PermissionCacheReader> _logger;

        public PermissionCacheReader(
            IConnectionMultiplexer redis,
            IProjectClient permissionClient,
            ILogger<PermissionCacheReader> logger)
        {
            _redis = redis;
            _permissionClient = permissionClient;
            _logger = logger;
        }

        public async Task<UserPermissionsResponse> GetUserPermissionsAsync(long userId, long projectId)
        {
            var db = _redis.GetDatabase();
            var roleKey = string.Format(RedisConstants.UserRoleKey, userId, projectId);
            var roleIdStr = await db.StringGetAsync(roleKey);

            if (roleIdStr.IsNullOrEmpty)
            {
                _logger.LogWarning("Cache miss for user {UserId} in project {ProjectId}, calling BoardService", userId, projectId);
                return await FetchFromBoardServiceAsync(userId, projectId);
            }

            if (!long.TryParse(roleIdStr, out var roleId))
            {
                _logger.LogWarning("Invalid roleId format in cache: {RoleId}", roleIdStr);
                return await FetchFromBoardServiceAsync(userId, projectId);
            }

            var permsKey = string.Format(RedisConstants.RolePermissionsKey, roleId);
            var permissions = await db.SetMembersAsync(permsKey);

            var ownerKey = string.Format(RedisConstants.RoleIsOwnerKey, roleId);
            var isOwnerStr = await db.StringGetAsync(ownerKey);

            if (permissions.Length == 0 || isOwnerStr.IsNullOrEmpty)
            {
                _logger.LogWarning("Partial cache miss for role {RoleId}, calling BoardService", roleId);
                return await FetchFromBoardServiceAsync(userId, projectId);
            }

            return new UserPermissionsResponse(
                userId,
                projectId,
                permissions.Select(p => p.ToString()).ToHashSet(),
                bool.Parse(isOwnerStr)
            );
        }

        private async Task<UserPermissionsResponse> FetchFromBoardServiceAsync(long userId, long projectId)
        {
            try
            {
                return await _permissionClient.GetUserPermissions(projectId, userId);
            }
            catch (ApiException NotFound) when (NotFound.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                throw new KeyNotFoundException($"Project with ID {projectId} not found");
            }
            catch (ApiException ex)
            {
                _logger.LogError(ex, "Board service error when calling GetUserPermissions({UserId}, {ProjectId})", userId, projectId);
                throw new InvalidOperationException($"Board service unavailable: {ex.Message}", ex);
            }
        }
    }
}
