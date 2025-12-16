namespace Backend.Sprints.Api.Services;

public interface ISprintIssueService
{
    Task AddIssuesToSprintAsync(long userId, long sprintId, List<long> issueIds);
    Task RemoveIssueFromSprintAsync(long userId, long sprintId, long issueId);
    Task<int> GetIssueCountBySprintIdAsync(long sprintId);
    Task<List<long>> GetIssueIdsBySprintIdAsync(long sprintId);
    Task ClearAllIssuesFromSprintAsync(long sprintId);
}