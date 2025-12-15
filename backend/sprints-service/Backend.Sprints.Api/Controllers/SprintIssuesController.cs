using Microsoft.AspNetCore.Mvc;
using Backend.Sprints.Api.Services;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Controllers;

[ApiController]
[Route("api/sprints/{sprintId}/[controller]")]
public class SprintIssuesController : ControllerBase
{
    private readonly ISprintIssueService _sprintIssueService;

    public SprintIssuesController(ISprintIssueService sprintIssueService)
    {
        _sprintIssueService = sprintIssueService;
    }

    [HttpPost]
    public async Task<IActionResult> AddIssueToSprint(long sprintId, [FromBody] AddIssueRequest request)
    {
        try
        {
            await _sprintIssueService.AddIssueToSprintAsync(sprintId, request.IssueId);
            return Ok(new { message = "Issue added to sprint successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("batch")]
    public async Task<IActionResult> AddIssuesToSprint(long sprintId, [FromBody] AddIssuesRequestDto request)
    {
        try
        {
            await _sprintIssueService.AddIssuesToSprintAsync(sprintId, request.IssueIds);
            return Ok(new { message = $"Added {request.IssueIds.Count} issues to sprint successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{issueId}")]
    public async Task<IActionResult> RemoveIssueFromSprint(long sprintId, long issueId)
    {
        try
        {
            await _sprintIssueService.RemoveIssueFromSprintAsync(sprintId, issueId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("batch")]
    public async Task<IActionResult> RemoveIssuesFromSprint(long sprintId, [FromBody] RemoveIssuesRequestDto request)
    {
        try
        {
            await _sprintIssueService.RemoveIssuesFromSprintAsync(sprintId, request.IssueIds);
            return Ok(new { message = $"Removed {request.IssueIds.Count} issues from sprint" });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetSprintIssues(long sprintId)
    {
        try
        {
            var issueIds = await _sprintIssueService.GetIssueIdsBySprintIdAsync(sprintId);
            return Ok(new { SprintId = sprintId, IssueIds = issueIds });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}