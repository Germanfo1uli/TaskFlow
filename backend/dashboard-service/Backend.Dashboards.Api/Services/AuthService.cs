using Backend.Dashboard.Api.Cache;
using Backend.Shared.DTOs;

namespace Backend.Dashboard.Api.Services
{
    public class AuthService
    {
        private readonly PermissionCacheReader _cacheReader;
        private readonly ILogger<AuthService> _logger;

        public AuthService(PermissionCacheReader cacheReader, ILogger<AuthService> logger)
        {
            _cacheReader = cacheReader;
            _logger = logger;
        }

        public async Task HasPermissionAsync(long userId, long projectId, EntityType entity, ActionType action)
        {
            var perms = await _cacheReader.GetUserPermissionsAsync(userId, projectId);
            var requiredPermission = $"{entity}:{action}";

            if (!perms.Permissions.Contains(requiredPermission))
            {
                throw new UnauthorizedAccessException(
                $"User {userId} has no {action} permission on {entity} in project {projectId}");
            }
        }

        public Task<UserPermissionsResponse> GetUserPermissionsAsync(long userId, long projectId)
        {
            return _cacheReader.GetUserPermissionsAsync(userId, projectId);
        }

        public void HasPermission(long userId, long projectId, EntityType entity, ActionType action)
        {
            HasPermissionAsync(userId, projectId, entity, action).GetAwaiter().GetResult();
        }
    }
}
