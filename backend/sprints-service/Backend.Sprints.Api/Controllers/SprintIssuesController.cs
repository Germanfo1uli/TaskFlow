using Microsoft.AspNetCore.Mvc;
using Backend.Sprints.Api.Services;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Controllers;

[ApiController]
[Route("api/sprints/{sprintId}/issues")]
public class SprintIssuesController : ControllerBase
{
    private readonly ISprintIssueService _sprintIssueService;
    private readonly ICurrentUserService _currentUser;

    public SprintIssuesController(ISprintIssueService sprintIssueService, ICurrentUserService currentUser)
    {
        _sprintIssueService = sprintIssueService;
        _currentUser = currentUser;
    }

    [HttpPost("batch")]
    public async Task<IActionResult> AddIssuesToSprint(long sprintId, [FromBody] AddIssuesRequestDto request)
    {
        try
        {
            await _sprintIssueService.AddIssuesToSprintAsync(_currentUser.UserId, sprintId, request.IssueIds);
            return Ok(new { message = $"Added {request.IssueIds.Count} issues to sprint successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{issueId}")]
    public async Task<IActionResult> RemoveIssueFromSprint(long sprintId, long issueId)
    {
        try
        {
            await _sprintIssueService.RemoveIssueFromSprintAsync(_currentUser.UserId, sprintId, issueId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}