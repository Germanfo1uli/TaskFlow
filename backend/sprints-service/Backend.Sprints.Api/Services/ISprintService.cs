using Backend.Sprints.Api.Models.Entities;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Services;

public interface ISprintService
{
    Task<SprintWithIssuesDto> CreateSprintWithIssuesAsync(long userId, long projectId, CreateSprintRequestDto request);
    Task<SprintWithIssuesDto> GetSprintByIdAsync(long userId, long id, long? projectId = null);
    Task<ProjectSprintsDto> GetSprintsByProjectIdAsync(long userId, long projectId);
    Task<SprintDto> UpdateSprintAsync(long userId, long id, UpdateSprintRequestDto request);
    Task DeleteSprintAsync(long userId, long id);
    Task<SprintWithIssuesDto> StartSprintAsync(long userId, long sprintId);
}