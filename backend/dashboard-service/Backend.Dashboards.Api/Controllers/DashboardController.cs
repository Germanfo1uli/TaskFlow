using Microsoft.AspNetCore.Mvc;
using Backend.Dashboard.Api.Services;
using Backend.Dashboard.Api.Models.Entities;

namespace Backend.Dashboard.Api.Controllers;

[ApiController]
[Route("api/projects/{projectId}/[controller]")]
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
            var dashboardData = await _dashboardService.GetDashboardDataAsync(projectId);
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

    [HttpPost("snapshots")]
    public async Task<ActionResult<DashboardSnapshot>> CreateSnapshot(long projectId, [FromBody] CreateSnapshotRequest request)
    {
        try
        {
            var snapshot = await _dashboardService.CreateSnapshotAsync(projectId, request.MetricName, request.MetricValue, request.SnapshotDate);
            return Ok(snapshot);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating snapshot for ProjectId: {ProjectId}", projectId);
            return BadRequest(ex.Message);
        }
    }
}

public class CreateSnapshotRequest
{
    public string MetricName { get; set; } = string.Empty;
    public decimal MetricValue { get; set; }
    public DateTime SnapshotDate { get; set; } = DateTime.UtcNow;
}