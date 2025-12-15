using Backend.Dashboard.Api.Clients;
using Backend.Dashboard.Api.Data.Repositories;
using Backend.Dashboard.Api.Models.Entities;
using Backend.Shared.DTOs;

namespace Backend.Dashboard.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly DashboardSnapshotRepository _snapshotRepository;
    private readonly ActivityLogRepository _activityLogRepository;
    private readonly IProjectClient _projectClient;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        DashboardSnapshotRepository snapshotRepository,
        ActivityLogRepository activityLogRepository,
        IProjectClient projectClient,
        ILogger<DashboardService> logger)
    {
        _snapshotRepository = snapshotRepository;
        _activityLogRepository = activityLogRepository;
        _projectClient = projectClient;
        _logger = logger;
    }

    public async Task<DashboardSnapshot> CreateSnapshotAsync(long projectId, string metricName, decimal metricValue, DateTime snapshotDate)
    {
        var snapshot = new DashboardSnapshot
        {
            ProjectId = projectId,
            MetricName = metricName,
            MetricValue = metricValue,
            SnapshotDate = snapshotDate
        };

        return await _snapshotRepository.CreateAsync(snapshot);
    }

    public async Task<DashboardEfficiencyDto> GetDashboardDataAsync(long projectId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        _logger.LogInformation("Getting real-time dashboard data for ProjectId: {ProjectId}", projectId);

        ProjectDto project;
        try
        {
            project = await _projectClient.GetProjectById(projectId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to verify project existence for ProjectId: {ProjectId}.", projectId);
            throw;
        }

        if (project == null)
        {
            _logger.LogWarning("Project with ID {ProjectId} not found.", projectId);
            throw new KeyNotFoundException($"Project with ID {projectId} not found.");
        }

        var dashboardData = new DashboardEfficiencyDto { ProjectId = projectId };

        var issueIds = await _activityLogRepository.GetEntityIdsByTypeAsync(projectId, "Issue", "Created");

        if (!issueIds.Any())
        {
            _logger.LogInformation("No issues found for ProjectId: {ProjectId}. All metrics are 0.", projectId);
            SetZeroMetrics(dashboardData);
            return dashboardData;
        }

        var latestStatuses = await _activityLogRepository.GetLatestStatusForIssuesAsync(projectId, issueIds);

        var issueCreators = await _activityLogRepository.GetIssueCreatorsAsync(projectId);

        var totalIssuesCount = issueIds.Count;
        var completedIssuesCount = latestStatuses.Values.Count(status => status == "DONE");
        var todoIssuesCount = latestStatuses.Values.Count(status => status == "TO_DO");
        var inProgressIssuesCount = latestStatuses.Values.Count(status => status == "IN_PROGRESS");
        var completionRate = totalIssuesCount > 0 ? (decimal)completedIssuesCount / totalIssuesCount * 100 : 0;

        dashboardData.CurrentMetrics["total_issues"] = totalIssuesCount;
        dashboardData.CurrentMetrics["completed_issues"] = completedIssuesCount;
        dashboardData.CurrentMetrics["todo_issues"] = todoIssuesCount;
        dashboardData.CurrentMetrics["in_progress_issues"] = inProgressIssuesCount;
        dashboardData.CurrentMetrics["completion_rate"] = completionRate;

        CalculateUserEfficiency(latestStatuses, issueCreators, dashboardData);

        _logger.LogInformation("Calculated metrics for ProjectId: {ProjectId}.", projectId);

        var recentActivity = await _activityLogRepository.GetByProjectIdAsync(projectId, 1, 10);
        dashboardData.RecentActivity = recentActivity.Select(log => new ActivityLogDto
        {
            UserId = log.UserId,
            ActionType = log.ActionType,
            EntityType = log.EntityType,
            EntityId = log.EntityId,
            CreatedAt = log.CreatedAt
        }).ToList();

        return dashboardData;
    }

    private void CalculateUserEfficiency(
    Dictionary<long, string> latestStatuses,
    Dictionary<long, long> issueCreators,
    DashboardEfficiencyDto dashboardData)
    {
        var userStats = new Dictionary<long, (int total, int completed)>();

        foreach (var statusPair in latestStatuses)
        {
            var issueId = statusPair.Key;
            var status = statusPair.Value;

            if (issueCreators.TryGetValue(issueId, out var creatorId))
            {
                if (!userStats.ContainsKey(creatorId))
                {
                    userStats[creatorId] = (0, 0);
                }

                var stats = userStats[creatorId];
                stats.total++;
                if (status == "DONE")
                {
                    stats.completed++;
                }
                
                userStats[creatorId] = stats;
            }
        }

        foreach (var userStat in userStats)
        {
            var userId = userStat.Key;
            var total = userStat.Value.total;
            var completed = userStat.Value.completed;
            var efficiency = total > 0 ? (decimal)completed / total * 100 : 0;
            dashboardData.UserEfficiency[userId] = efficiency;
        }
    }

    private void SetZeroMetrics(DashboardEfficiencyDto dashboardData)
    {
        dashboardData.CurrentMetrics["total_issues"] = 0;
        dashboardData.CurrentMetrics["completed_issues"] = 0;
        dashboardData.CurrentMetrics["todo_issues"] = 0;
        dashboardData.CurrentMetrics["in_progress_issues"] = 0;
        dashboardData.CurrentMetrics["completion_rate"] = 0;
    }


    public async Task<List<MetricTrendDto>> GetMetricTrendAsync(long projectId, string metricName, DateTime fromDate, DateTime toDate)
    {
        var snapshots = await _snapshotRepository.GetByProjectAndMetricAsync(projectId, metricName, fromDate, toDate);

        var trend = new MetricTrendDto
        {
            MetricName = metricName,
            DataPoints = snapshots.Select(s => new MetricDataPoint
            {
                Date = s.SnapshotDate,
                Value = s.MetricValue
            }).ToList()
        };

        return new List<MetricTrendDto> { trend };
    }

    private async Task SaveMetrics(long projectId, int totalIssues, int completedIssues, decimal completionRate, decimal avgCycleTime)
    {
        var now = DateTime.UtcNow;
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "total_issues", MetricValue = totalIssues, SnapshotDate = now });
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "completed_issues", MetricValue = completedIssues, SnapshotDate = now });
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "completion_rate", MetricValue = completionRate, SnapshotDate = now });
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "avg_cycle_time_days", MetricValue = avgCycleTime, SnapshotDate = now });
    }
}