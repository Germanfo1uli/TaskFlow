using Microsoft.AspNetCore.Mvc;
using Backend.Dashboard.Api.Services;

namespace Backend.Dashboard.Api.Controllers;

[ApiController]
[Route("api/projects/{projectId}/[controller]")]
public class ActivityLogController : ControllerBase
{
    private readonly IActivityLogService _activityLogService;
    private readonly ILogger<ActivityLogController> _logger;

    public ActivityLogController(IActivityLogService activityLogService, ILogger<ActivityLogController> logger)
    {
        _activityLogService = activityLogService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<ActivityLogDto>>> GetProjectActivity(
        long projectId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
           
            var activityLogs = await _activityLogService.GetProjectActivityAsync(projectId, page, pageSize);

            var activityDtos = activityLogs.Select(log => new ActivityLogDto
            {
                UserId = log.UserId,
                ActionType = log.ActionType,
                EntityType = log.EntityType,
                EntityId = log.EntityId,
                CreatedAt = log.CreatedAt
            }).ToList();

            return Ok(activityDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching activity for ProjectId: {ProjectId}", projectId);
            return StatusCode(500, "An internal server error occurred.");
        }
    }
}