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
    private readonly AuthService _authService;

    public DashboardService(
        DashboardSnapshotRepository snapshotRepository,
        ActivityLogRepository activityLogRepository,
        IProjectClient projectClient,
        ILogger<DashboardService> logger,
        AuthService authService)
    {
        _snapshotRepository = snapshotRepository;
        _activityLogRepository = activityLogRepository;
        _projectClient = projectClient;
        _logger = logger;
        _authService = authService;
    }

    public async Task<DashboardSnapshot> CreateSnapshotAsync(long projectId, string metricName, decimal metricValue, DateTime snapshotDate)
    {
        var snapshot = new DashboardSnapshot { ProjectId = projectId, MetricName = metricName, MetricValue = metricValue, SnapshotDate = snapshotDate };
        return await _snapshotRepository.CreateAsync(snapshot);
    }

    public async Task<DashboardEfficiencyDto> CalculateAndSaveDashboardDataAsync(long usersId, long projectId)
    {
        await _authService.HasPermissionAsync(usersId, projectId,
                Cache.EntityType.ANALYTICS, Cache.ActionType.VIEW);
        _logger.LogInformation("Calculating and saving dashboard data for ProjectId: {ProjectId}", projectId);

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
        var now = DateTime.UtcNow;

        var createdIssueIds = await _activityLogRepository.GetEntityIdsByTypeAsync(projectId, "Issue", "Created");

        var deletedIssueIds = await _activityLogRepository.GetDeletedEntityIdsAsync(projectId, "Issue");
        var activeIssueIds = createdIssueIds.Except(deletedIssueIds).ToList();

        if (!activeIssueIds.Any())
        {
            _logger.LogInformation("No active issues found for ProjectId: {ProjectId}. All metrics are 0.", projectId);
            SetZeroMetrics(dashboardData);
            await SaveAllMetrics(projectId, 0, 0, 0, 0, new Dictionary<long, (int total, int completed)>(), now);
            return dashboardData;
        }

        var latestStatuses = await _activityLogRepository.GetLatestStatusForIssuesAsync(projectId, activeIssueIds);
        var issueCreators = await _activityLogRepository.GetIssueCreatorsAsync(projectId, activeIssueIds);

        var totalIssuesCount = activeIssueIds.Count;
        var completedIssuesCount = latestStatuses.Values.Count(status => status == "DONE");
        var inProgressIssuesCount = latestStatuses.Values.Count(status => status == "IN_PROGRESS");

        var todoIssuesCount = latestStatuses.Values.Count(status => status == "Created");

        var completionRate = totalIssuesCount > 0 ? (decimal)completedIssuesCount / totalIssuesCount * 100 : 0;

        var userStats = CalculateUserEfficiency(latestStatuses, issueCreators);

        await SaveAllMetrics(projectId, totalIssuesCount, completedIssuesCount, todoIssuesCount, inProgressIssuesCount, userStats, now);

        dashboardData.CurrentMetrics["total_issues"] = totalIssuesCount;
        dashboardData.CurrentMetrics["completed_issues"] = completedIssuesCount;
        dashboardData.CurrentMetrics["todo_issues"] = todoIssuesCount;
        dashboardData.CurrentMetrics["in_progress_issues"] = inProgressIssuesCount;
        dashboardData.CurrentMetrics["completion_rate"] = completionRate;

        foreach (var userStat in userStats)
        {
            var userId = userStat.Key;
            var total = userStat.Value.total;
            var completed = userStat.Value.completed;
            var efficiency = total > 0 ? (decimal)completed / total * 100 : 0;
            dashboardData.UserEfficiency[userId] = efficiency;
        }

        _logger.LogInformation("Calculated and saved metrics for ProjectId: {ProjectId}.", projectId);
        return dashboardData;
    }
    private Dictionary<long, (int total, int completed)> CalculateUserEfficiency(
        Dictionary<long, string> latestStatuses,
        Dictionary<long, long> issueCreators)
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
        return userStats;
    }

    private async Task SaveAllMetrics(long projectId, int total, int completed, int todo, int inProgress, Dictionary<long, (int total, int completed)> userStats, DateTime snapshotDate)
    {
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "total_issues", MetricValue = total, SnapshotDate = snapshotDate });
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "completed_issues", MetricValue = completed, SnapshotDate = snapshotDate });
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "todo_issues", MetricValue = todo, SnapshotDate = snapshotDate });
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "in_progress_issues", MetricValue = inProgress, SnapshotDate = snapshotDate });
        await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = "completion_rate", MetricValue = total > 0 ? (decimal)completed / total * 100 : 0, SnapshotDate = snapshotDate });

        foreach (var userStat in userStats)
        {
            var userId = userStat.Key;
            var userTotal = userStat.Value.total;
            var userCompleted = userStat.Value.completed;
            var efficiency = userTotal > 0 ? (decimal)userCompleted / userTotal * 100 : 0;
            var metricName = $"user_efficiency_{userId}";

            await _snapshotRepository.CreateAsync(new DashboardSnapshot { ProjectId = projectId, MetricName = metricName, MetricValue = efficiency, SnapshotDate = snapshotDate });
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
}