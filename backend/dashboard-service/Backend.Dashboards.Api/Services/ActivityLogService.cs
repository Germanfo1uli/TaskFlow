using Backend.Dashboard.Api.Data.Repositories;
using Backend.Dashboard.Api.Models.Entities;

namespace Backend.Dashboard.Api.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly ActivityLogRepository _activityLogRepository;
    private readonly AuthService _authService;

    public ActivityLogService(ActivityLogRepository activityLogRepository, AuthService authService)
    {
        _activityLogRepository = activityLogRepository;
        _authService = authService;
    }

    public async Task<ActivityLog> LogActivityAsync(long projectId, long userId, string actionType, string entityType, long entityId)
    {
        var log = new ActivityLog
        {
            ProjectId = projectId,
            UserId = userId,
            ActionType = actionType,
            EntityType = entityType,
            EntityId = entityId
        };

        return await _activityLogRepository.CreateAsync(log);
    }

    public async Task<List<ActivityLog>> GetProjectActivityAsync(long userId, long projectId, int page = 1, int pageSize = 50)
    {
        await _authService.HasPermissionAsync(userId, projectId,
                Cache.EntityType.LOGS, Cache.ActionType.VIEW);
        return await _activityLogRepository.GetByProjectIdAsync(projectId, page, pageSize);
    }

    public async Task<List<ActivityLog>> GetUserActivityAsync(long userId, int page = 1, int pageSize = 50)
    {
        return await _activityLogRepository.GetByUserIdAsync(userId, page, pageSize);
    }
}