using Backend.Dashboard.Api.Clients;
using Microsoft.Extensions.Caching.Distributed;
using Refit;
using StackExchange.Redis;
using System.Net.Http.Json;
using System.Text.Json;

namespace Backend.Dashboard.Api.Cache
{
    public class PermissionCacheReader
    {
        private readonly IDistributedCache _redis;
        private readonly IProjectClient _projectClient;
        private readonly ILogger<PermissionCacheReader> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public PermissionCacheReader(
            IDistributedCache redis,
            IProjectClient projectClient,
            ILogger<PermissionCacheReader> logger)
        {
            _redis = redis;
            _projectClient = projectClient;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        }

        public async Task<UserPermissionsResponse> GetUserPermissionsAsync(long userId, long projectId)
        {
            var roleKey = string.Format(RedisConstants.UserRoleKey, userId, projectId);
            var roleIdStr = await _redis.GetStringAsync(roleKey);

            if (string.IsNullOrEmpty(roleIdStr))
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
            var permissionsJson = await _redis.GetStringAsync(permsKey);
            HashSet<string> permissions = null;

            if (!string.IsNullOrEmpty(permissionsJson))
            {
                permissions = JsonSerializer.Deserialize<HashSet<string>>(permissionsJson, _jsonOptions);
            }

            var ownerKey = string.Format(RedisConstants.RoleIsOwnerKey, roleId);
            var isOwnerStr = await _redis.GetStringAsync(ownerKey);

            if (permissions == null || string.IsNullOrEmpty(isOwnerStr))
            {
                _logger.LogWarning("Partial cache miss for role {RoleId}, calling BoardService", roleId);
                return await FetchFromBoardServiceAsync(userId, projectId);
            }

            return new UserPermissionsResponse(
                userId,
                projectId,
                permissions,
                bool.Parse(isOwnerStr)
            );
        }

        private async Task<UserPermissionsResponse> FetchFromBoardServiceAsync(long userId, long projectId)
        {
            try
            {
                return await _projectClient.GetUserPermissions(userId, projectId);
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
