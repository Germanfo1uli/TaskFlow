using Microsoft.AspNetCore.Mvc;
using Backend.Dashboard.Api.Services;

namespace Backend.Dashboard.Api.Controllers;

[ApiController]
[Route("api/dashboards/{projectId}/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardEfficiencyDto>> GetDashboard(long projectId)
    {
        try
        {
            // ОДИН ЗАПРОС - ВСЕ ДЕЙСТВИЯ НА СЕРВЕРЕ
            var dashboardData = await _dashboardService.CalculateAndSaveDashboardDataAsync(projectId);
            return Ok(dashboardData);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching dashboard for ProjectId: {ProjectId}", projectId);
            return StatusCode(500, "An internal server error occurred.");
        }
    }

    [HttpGet("metrics/{metricName}/trend")]
    public async Task<ActionResult<List<MetricTrendDto>>> GetMetricTrend(long projectId, string metricName, [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        try
        {
            var trend = await _dashboardService.GetMetricTrendAsync(projectId, metricName, fromDate, toDate);
            return Ok(trend);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching trend for ProjectId: {ProjectId}", projectId);
            return BadRequest(ex.Message);
        }
    }
}