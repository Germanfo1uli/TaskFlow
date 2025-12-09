using Backend.Dashboard.Api.Clients;
using Backend.Shared.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Dashboard.Api.Controllers
{
    [ApiController]
    [Route("api/debug")]
    public class DebugController : ControllerBase
    {
        private readonly IProjectClient _projectClient;
        private readonly ILogger<DebugController> _logger;

        public DebugController(IProjectClient projectClient, ILogger<DebugController> logger)
        {
            _projectClient = projectClient;
            _logger = logger;
        }

        [HttpGet("test-project/{id}")]
        public async Task<IActionResult> TestProjectClient(long id)
        {
            try
            {
                _logger.LogInformation("Attempting to fetch project with ID: {ProjectId}", id);

                var project = await _projectClient.GetProjectById(id);

                if (project == null)
                {
                    _logger.LogWarning("Project with ID: {ProjectId} not found.", id);
                    return NotFound($"Project with ID {id} not found in project-service.");
                }

                var successMessage = $"Successfully fetched project from project-service! Name: {project.Name}";
                _logger.LogInformation(successMessage);
                return Ok(successMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to call project-service for project ID: {ProjectId}", id);
                return StatusCode(500, $"Failed to call project-service. Error: {ex.Message}");
            }
        }
    }
}