using Backend.Sprints.Api.Data.Repositories;

namespace Backend.Sprints.Api.Services;

public class SprintIssueService : ISprintIssueService
{
    private readonly SprintIssueRepository _sprintIssueRepository;

    public SprintIssueService(SprintIssueRepository sprintIssueRepository)
    {
        _sprintIssueRepository = sprintIssueRepository;
    }

    public async Task AddIssueToSprintAsync(long sprintId, long issueId)
    {
        // Автоматически удаляем задачу из других спринтов
        await _sprintIssueRepository.RemoveIssueFromAllSprintsAsync(issueId);
        
        // Добавляем в текущий спринт
        await _sprintIssueRepository.AddIssueToSprintAsync(sprintId, issueId);
    }

    // Новый метод для батч добавления
    public async Task AddIssuesToSprintAsync(long sprintId, List<long> issueIds)
    {
        foreach (var issueId in issueIds)
        {
            await AddIssueToSprintAsync(sprintId, issueId);
        }
    }

    // Новый метод для батч удаления
    public async Task RemoveIssuesFromSprintAsync(long sprintId, List<long> issueIds)
    {
        foreach (var issueId in issueIds)
        {
            await _sprintIssueRepository.RemoveIssueFromSprintAsync(sprintId, issueId);
        }
    }

    // Остальные методы остаются без изменений
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