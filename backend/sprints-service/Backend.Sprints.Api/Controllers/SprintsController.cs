using Microsoft.AspNetCore.Mvc;
using Backend.Sprints.Api.Services;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SprintsController : ControllerBase
{
    private readonly ISprintService _sprintService;

    public SprintsController(ISprintService sprintService)
    {
        _sprintService = sprintService;
    }

    [HttpPost("projects/{projectId}/sprints")]
    public async Task<IActionResult> CreateSprint(long projectId, [FromBody] CreateSprintRequestDto request)
    {
        try
        {
            var sprint = await _sprintService.CreateSprintWithIssuesAsync(projectId, request);
            return CreatedAtAction(nameof(GetSprint), new { id = sprint.Id }, sprint);
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
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("projects/{projectId}/sprints")]
    public async Task<IActionResult> GetSprintsByProject(long projectId)
    {
        try
        {
            var sprints = await _sprintService.GetSprintsByProjectIdAsync(projectId);
            return Ok(sprints);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("projects/{projectId}/sprints-with-issues")]
    public async Task<IActionResult> GetProjectSprintsWithIssues(long projectId)
    {
        try
        {
            var result = await _sprintService.GetProjectSprintsWithIssuesAsync(projectId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSprint(long id)
    {
        try
        {
            var sprint = await _sprintService.GetSprintByIdAsync(id);
            return Ok(sprint);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSprint(long id, [FromBody] UpdateSprintRequestDto request)
    {
        try
        {
            var sprint = await _sprintService.UpdateSprintAsync(id, request.Name, request.Goal, 
                request.StartDate, request.EndDate, request.Status);
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
            await _sprintService.DeleteSprintAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{sprintId}/complete")]
    public async Task<IActionResult> CompleteSprint(long sprintId)
    {
        try
        {
            await _sprintService.CompleteSprintAsync(sprintId);
            return Ok(new { message = "Sprint completed successfully" });
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
            await _sprintService.StartSprintAsync(sprintId);
            return Ok(new { message = "Sprint started successfully" });
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

    [HttpGet("{sprintId}/board")]
    public async Task<IActionResult> GetSprintBoard(long sprintId)
    {
        try
        {
            var board = await _sprintService.GetSprintBoardAsync(sprintId);
            return Ok(board);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}