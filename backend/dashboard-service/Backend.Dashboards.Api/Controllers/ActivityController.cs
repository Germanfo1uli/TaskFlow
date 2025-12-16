using Microsoft.AspNetCore.Mvc;
using Backend.Dashboard.Api.Services;

namespace Backend.Dashboard.Api.Controllers;

[ApiController]
[Route("api/logs/projects/{projectId}/[controller]")]
public class ActivityController : ControllerBase
{
    private readonly IActivityLogService _activityLogService;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<GatewayAuthenticationMiddleware> _logger;

    public ActivityController(IActivityLogService activityLogService, ICurrentUserService currentUser, ILogger<GatewayAuthenticationMiddleware> logger)
    {
        _activityLogService = activityLogService;
        _currentUser = currentUser;
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
            _logger.LogInformation("User {UserId} accessing activity for project {ProjectId}", _currentUser.UserId, projectId);

            var activityLogs = await _activityLogService.GetProjectActivityAsync(_currentUser.UserId, projectId, page, pageSize);

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