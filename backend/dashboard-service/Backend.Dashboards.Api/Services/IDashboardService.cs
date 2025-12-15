using Backend.Dashboard.Api.Models.Entities;

namespace Backend.Dashboard.Api.Services;

public interface IDashboardService
{
    Task<DashboardSnapshot> CreateSnapshotAsync(long projectId, string metricName, decimal metricValue, DateTime snapshotDate);
    Task<DashboardEfficiencyDto> GetDashboardDataAsync(long projectId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<List<MetricTrendDto>> GetMetricTrendAsync(long projectId, string metricName, DateTime fromDate, DateTime toDate);
}

public class DashboardDataDto
{
    public long ProjectId { get; set; }
    public Dictionary<string, decimal> CurrentMetrics { get; set; } = new();
    public List<ActivityLogDto> RecentActivity { get; set; } = new();
    public Dictionary<string, MetricTrendDto> Trends { get; set; } = new();
}

public class MetricTrendDto
{
    public string MetricName { get; set; } = string.Empty;
    public List<MetricDataPoint> DataPoints { get; set; } = new();
}

public class MetricDataPoint
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
}

public class ActivityLogDto
{
    public long UserId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public long EntityId { get; set; }
    public DateTime CreatedAt { get; set; }
}