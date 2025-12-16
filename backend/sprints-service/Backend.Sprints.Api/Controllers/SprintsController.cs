using Microsoft.AspNetCore.Mvc;
using Backend.Sprints.Api.Services;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Controllers;

[ApiController]
[Route("api/sprints")]
public class SprintsController : ControllerBase
{
    private readonly ISprintService _sprintService;
    private readonly ICurrentUserService _currentUser;

    public SprintsController(ISprintService sprintService, ICurrentUserService currentUser)
    {
        _sprintService = sprintService;
        _currentUser = currentUser;
    }

    [HttpGet("projects/{projectId}")]
    public async Task<IActionResult> GetSprintsByProject(long projectId)
    {
        try
        {
            var sprints = await _sprintService.GetSprintsByProjectIdAsync(_currentUser.UserId, projectId);
            return Ok(sprints);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{sprintId}")]
    public async Task<IActionResult> GetSprint(long sprintId, [FromQuery] long? projectId = null)
    {
        try
        {
            var sprint = await _sprintService.GetSprintByIdAsync(_currentUser.UserId, sprintId, projectId);
            return Ok(sprint);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("projects/{projectId}")]
    public async Task<IActionResult> CreateSprint(long projectId, [FromBody] CreateSprintRequestDto request)
    {
        try
        {
            var sprint = await _sprintService.CreateSprintWithIssuesAsync(_currentUser.UserId, projectId, request);
            return CreatedAtAction(nameof(GetSprint), new { sprintId = sprint.Id }, sprint);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateSprint(long id, [FromBody] UpdateSprintRequestDto request)
    {
        try
        {
            var sprint = await _sprintService.UpdateSprintAsync(_currentUser.UserId, id, request);
            return Ok(sprint);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSprint(long id)
    {
        try
        {
            await _sprintService.DeleteSprintAsync(_currentUser.UserId, id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{sprintId}/start")]
    public async Task<IActionResult> StartSprint(long sprintId)
    {
        try
        {
            var sprint = await _sprintService.StartSprintAsync(_currentUser.UserId, sprintId);
            return Ok(sprint);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}