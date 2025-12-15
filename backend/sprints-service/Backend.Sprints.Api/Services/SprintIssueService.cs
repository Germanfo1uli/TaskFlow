using Backend.Sprints.Api.Data.Repositories;
using Backend.Sprints.Api.Clients;

namespace Backend.Sprints.Api.Services;

public class SprintIssueService : ISprintIssueService
{
    private readonly SprintIssueRepository _sprintIssueRepository;
    private readonly IInternalApiClient _internalApiClient;

    public SprintIssueService(
        SprintIssueRepository sprintIssueRepository,
        IInternalApiClient internalApiClient)
    {
        _sprintIssueRepository = sprintIssueRepository;
        _internalApiClient = internalApiClient;
    }

    public async Task AddIssueToSprintAsync(long sprintId, long issueId)
    {
        // Проверяем задачу
        var issueResponse = await _internalApiClient.IssueExistsAsync(issueId);
        if (!issueResponse.IsSuccessStatusCode || !issueResponse.Content)
            throw new KeyNotFoundException($"Issue with id {issueId} not found");
        
        await _sprintIssueRepository.RemoveIssueFromAllSprintsAsync(issueId);
        await _sprintIssueRepository.AddIssueToSprintAsync(sprintId, issueId);
    }

    public async Task AddIssuesToSprintAsync(long sprintId, List<long> issueIds)
    {
        foreach (var issueId in issueIds)
        {
            await AddIssueToSprintAsync(sprintId, issueId);
        }
    }

    public async Task RemoveIssuesFromSprintAsync(long sprintId, List<long> issueIds)
    {
        foreach (var issueId in issueIds)
        {
            await _sprintIssueRepository.RemoveIssueFromSprintAsync(sprintId, issueId);
        }
    }

    public async Task RemoveIssueFromSprintAsync(long sprintId, long issueId)
    {
        await _sprintIssueRepository.RemoveIssueFromSprintAsync(sprintId, issueId);
    }

    public async Task<List<long>> GetIssueIdsBySprintIdAsync(long sprintId)
    {
        return await _sprintIssueRepository.GetIssueIdsBySprintIdAsync(sprintId);
    }

    public async Task<List<long>> GetSprintIdsByIssueIdAsync(long issueId)
    {
        return await _sprintIssueRepository.GetSprintIdsByIssueIdAsync(issueId);
    }

    public async Task<bool> IsIssueInSprintAsync(long sprintId, long issueId)
    {
        return await _sprintIssueRepository.IsIssueInSprintAsync(sprintId, issueId);
    }
}