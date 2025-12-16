using Backend.Dashboard.Api.Models.Entities;

namespace Backend.Dashboard.Api.Services;

public interface IActivityLogService
{
    Task<ActivityLog> LogActivityAsync(long projectId, long userId, string actionType, string entityType, long entityId);
    Task<List<ActivityLog>> GetProjectActivityAsync(long userId, long projectId, int page = 1, int pageSize = 50);
    Task<List<ActivityLog>> GetUserActivityAsync(long userId, int page = 1, int pageSize = 50);
}