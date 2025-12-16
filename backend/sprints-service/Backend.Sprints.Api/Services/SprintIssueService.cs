using Backend.Sprints.Api.Data.Repositories;
using Backend.Sprints.Api.Clients;
using Backend.Shared.DTOs;
using Refit;
using Backend.Sprints.Api.Models.Entities;

namespace Backend.Sprints.Api.Services;

public class SprintIssueService : ISprintIssueService
{
    private readonly SprintIssueRepository _sprintIssueRepository;
    private readonly SprintRepository _sprintRepository;
    private readonly IIssueClient _issueClient;
    private readonly ILogger<SprintIssueService> _logger;
    private readonly AuthService _authService;

    public SprintIssueService(
        SprintIssueRepository sprintIssueRepository,
        SprintRepository sprintRepository,
        IIssueClient issueClient,
        ILogger<SprintIssueService> logger,
        AuthService authService)
    {
        _sprintIssueRepository = sprintIssueRepository;
        _sprintRepository = sprintRepository;
        _issueClient = issueClient;
        _logger = logger;
        _authService = authService;
    }

    public async Task AddIssuesToSprintAsync(long userId, long sprintId, List<long> issueIds)
    {
        if (issueIds == null || !issueIds.Any()) return;
        var sprint = await _sprintRepository.GetByIdAsync(sprintId);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {sprintId} not found");
        await _authService.HasPermissionAsync(userId, sprint.ProjectId,
            Cache.EntityType.SPRINT, Cache.ActionType.MANAGE);

        try
        {
            var existingIssues = await _issueClient.GetIssuesByIds(
                new IssueBatchRequest { IssuesIds = issueIds });

            var foundIds = existingIssues.Select(i => i.Id).ToHashSet();
            var missingIds = issueIds.Except(foundIds).ToList();

            if (missingIds.Any())
                throw new KeyNotFoundException($"Issues with ids {string.Join(", ", missingIds)} not found");
        }
        catch (ApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("One or more issues not found");
        }

        await _sprintIssueRepository.RemoveIssuesFromAllSprintsAsync(issueIds);

        await _sprintIssueRepository.AddIssuesToSprintAsync(sprintId, issueIds);
        _logger.LogInformation("Added {Count} issues to sprint {SprintId}", issueIds.Count, sprintId);
    }

    public async Task RemoveIssueFromSprintAsync(long userId, long sprintId, long issueId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {sprintId} not found");
        await _authService.HasPermissionAsync(userId, sprint.ProjectId,
            Cache.EntityType.SPRINT, Cache.ActionType.MANAGE);
        var exists = await _sprintIssueRepository.IsIssueInSprintAsync(sprintId, issueId);
        if (!exists)
        {
            _logger.LogWarning("Issue {IssueId} not found in sprint {SprintId}", issueId, sprintId);
            throw new KeyNotFoundException($"Issue with id {issueId} not found in sprint {sprintId}");
        }

        await _sprintIssueRepository.RemoveIssueFromSprintAsync(sprintId, issueId);
        _logger.LogInformation("Removed issue {IssueId} from sprint {SprintId}", issueId, sprintId);
    }

    public async Task<int> GetIssueCountBySprintIdAsync(long sprintId)
    {
        return await _sprintIssueRepository.GetIssueCountBySprintIdAsync(sprintId);
    }

    public async Task<List<long>> GetIssueIdsBySprintIdAsync(long sprintId)
    {
        return await _sprintIssueRepository.GetIssueIdsBySprintIdAsync(sprintId);
    }

    public async Task ClearAllIssuesFromSprintAsync(long sprintId)
    {
        var count = await _sprintIssueRepository.GetIssueCountBySprintIdAsync(sprintId);
        if (count > 0)
        {
            await _sprintIssueRepository.ClearAllIssuesFromSprintAsync(sprintId);
            _logger.LogInformation("Cleared {Count} issues from sprint {SprintId}", count, sprintId);
        }
    }
}