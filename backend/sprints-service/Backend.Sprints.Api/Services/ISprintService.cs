using Backend.Sprints.Api.Models.Entities;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Services;

public interface ISprintService
{
    // Существующие методы
    Task<Sprint> CreateSprintAsync(long projectId, string name, string? goal, DateTime startDate, DateTime endDate);
    Task<Sprint?> GetSprintByIdAsync(long id);
    Task<List<Sprint>> GetSprintsByProjectIdAsync(long projectId);
    Task<Sprint> UpdateSprintAsync(long id, string name, string? goal, DateTime? startDate, DateTime? endDate, SprintStatus status);
    Task DeleteSprintAsync(long id);
    Task CompleteSprintAsync(long sprintId);
    Task<SprintBoardDto> GetSprintBoardAsync(long sprintId);
    Task<bool> HasDateOverlapAsync(long projectId, DateTime startDate, DateTime endDate, long? excludeSprintId = null);

    // Новые методы для обновленных требований
    Task<Sprint> CreateSprintWithIssuesAsync(long projectId, CreateSprintRequestDto request);
    Task AddIssuesToSprintAsync(long sprintId, List<long> issueIds);
    Task StartSprintAsync(long sprintId);
    Task<ProjectSprintsDto> GetProjectSprintsWithIssuesAsync(long projectId);
}