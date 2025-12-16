namespace Backend.Dashboard.Api.Services
{
    public class DashboardEfficiencyDto
    {
        public long ProjectId { get; set; }

        public Dictionary<string, decimal> CurrentMetrics { get; set; } = new();

        public Dictionary<long, decimal> UserEfficiency { get; set; } = new();

        public List<ActivityLogDto> RecentActivity { get; set; } = new();
        public Dictionary<string, MetricTrendDto> Trends { get; set; } = new();
    }
}
