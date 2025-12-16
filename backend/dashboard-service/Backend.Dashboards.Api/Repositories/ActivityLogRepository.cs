using Microsoft.EntityFrameworkCore;
using Backend.Dashboard.Api.Models.Entities;

namespace Backend.Dashboard.Api.Data.Repositories;

public class ActivityLogRepository
{
    private readonly DashboardDbContext _context;

    public ActivityLogRepository(DashboardDbContext context)
    {
        _context = context;
    }

    public async Task<ActivityLog> CreateAsync(ActivityLog log)
    {
        _context.ActivityLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<List<ActivityLog>> GetByProjectIdAsync(long projectId, int page = 1, int pageSize = 50)
    {
        return await _context.ActivityLogs
            .Where(l => l.ProjectId == projectId)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<ActivityLog>> GetByUserIdAsync(long userId, int page = 1, int pageSize = 50)
    {
        return await _context.ActivityLogs
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<ActivityLog>> GetByEntityAsync(string entityType, long entityId, int page = 1, int pageSize = 50)
    {
        return await _context.ActivityLogs
            .Where(l => l.EntityType == entityType && l.EntityId == entityId)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<long>> GetEntityIdsByTypeAsync(long projectId, string entityType, string actionType)
    {
        return await _context.ActivityLogs
            .Where(log => log.ProjectId == projectId && log.EntityType == entityType && log.ActionType == actionType)
            .Select(log => log.EntityId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<Dictionary<long, string>> GetLatestStatusForIssuesAsync(long projectId, IEnumerable<long> issueIds)
    {
        var statusActionTypes = new[]
        {
        "SELECTED_FOR_DEVELOPMENT", "IN_PROGRESS", "CODE_REVIEW", "QA", "STAGING", "DONE", "Created"
    };

        return await _context.ActivityLogs
            .Where(log => log.ProjectId == projectId &&
                           issueIds.Contains(log.EntityId) &&
                           log.EntityType == "Issue" &&
                           statusActionTypes.Contains(log.ActionType))

            .GroupBy(log => log.EntityId)
            .Select(group => group.OrderByDescending(log => log.CreatedAt).First())
            .ToDictionaryAsync(log => log.EntityId, log => log.ActionType);
    }

    public async Task<List<decimal>> GetCycleTimesForCompletedIssuesAsync(long projectId, IEnumerable<long> completedIssueIds)
    {
        if (!completedIssueIds.Any())
        {
            return new List<decimal>();
        }

        var creationLogs = await _context.ActivityLogs
            .Where(log => log.ProjectId == projectId &&
                           completedIssueIds.Contains(log.EntityId) &&
                           log.EntityType == "Issue" &&
                           log.ActionType == "Created")
            .ToListAsync();

        var creationDates = creationLogs.ToDictionary(log => log.EntityId, log => log.CreatedAt);

        var completionLogs = await _context.ActivityLogs
            .Where(log => log.ProjectId == projectId &&
                           completedIssueIds.Contains(log.EntityId) &&
                           log.EntityType == "Issue" &&
                           log.ActionType == "DONE")
            .ToListAsync();

        var completionDates = completionLogs.ToDictionary(log => log.EntityId, log => log.CreatedAt);

        var cycleTimes = new List<decimal>();
        foreach (var issueId in completedIssueIds)
        {
            if (creationDates.TryGetValue(issueId, out var createdDate) &&
                completionDates.TryGetValue(issueId, out var completedDate))
            {
                var cycleTime = (decimal)(completedDate - createdDate).TotalDays;
                cycleTimes.Add(cycleTime);
            }
        }

        return cycleTimes;
    }

    public async Task<List<long>> GetDeletedEntityIdsAsync(long projectId, string entityType)
    {
        return await _context.ActivityLogs
            .Where(log => log.ProjectId == projectId && log.EntityType == entityType && log.ActionType == "Deleted")
            .Select(log => log.EntityId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<Dictionary<long, long>> GetIssueCreatorsAsync(long projectId, IEnumerable<long> activeIssueIds)
    {
        if (!activeIssueIds.Any())
        {
            return new Dictionary<long, long>();
        }

        return await _context.ActivityLogs
            .Where(log => log.ProjectId == projectId &&
                           activeIssueIds.Contains(log.EntityId) && 
                           log.EntityType == "Issue" &&
                           log.ActionType == "Created")
            .ToDictionaryAsync(log => log.EntityId, log => log.UserId);
    }
}