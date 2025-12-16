using Backend.Sprints.Api.Clients;
using Backend.Sprints.Api.Data.Repositories;
using Backend.Sprints.Api.Models.Entities;
using Backend.Shared.DTOs;
using Refit;

namespace Backend.Sprints.Api.Services;

public class SprintService : ISprintService
{
    private readonly SprintRepository _sprintRepository;
    private readonly ISprintIssueService _sprintIssueService;
    private readonly IProjectClient _projectClient;
    private readonly IIssueClient _issueClient;
    private readonly ILogger<SprintService> _logger;
    private readonly AuthService _authService;

    public SprintService(
        SprintRepository sprintRepository,
        ISprintIssueService sprintIssueService,
        IProjectClient projectClient,
        IIssueClient issueClient,
        ILogger<SprintService> logger,
        AuthService authService)
    {
        _sprintRepository = sprintRepository;
        _sprintIssueService = sprintIssueService;
        _projectClient = projectClient;
        _issueClient = issueClient;
        _logger = logger;
        _authService = authService;
    }

    public async Task<SprintWithIssuesDto> CreateSprintWithIssuesAsync(long userId, long projectId, CreateSprintRequestDto request)
    {
        await _authService.HasPermissionAsync(userId, projectId,
            Cache.EntityType.SPRINT, Cache.ActionType.MANAGE);
        try
        {
            await _projectClient.GetProjectByIdAsync(projectId);
        }
        catch (ApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException($"Project with id {projectId} not found");
        }

        var startDate = request.StartDate ?? null;
        var endDate = request.EndDate ?? null;
        if (startDate >= endDate)
            throw new ArgumentException("Start date must be before end date");

        var sprint = new Sprint
        {
            ProjectId = projectId,
            Name = request.Name,
            Goal = request.Goal,
            StartDate = startDate,
            EndDate = endDate,
            Status = SprintStatus.Planned
        };
        sprint = await _sprintRepository.CreateAsync(sprint);

        if (request.IssueIds?.Any() == true)
        {
            await _sprintIssueService.AddIssuesToSprintAsync(userId, sprint.Id, request.IssueIds);
        }

        var issues = new List<InternalIssueResponse>();
        if (request.IssueIds?.Any() == true)
        {
            issues = await _issueClient.GetIssuesByIds(new IssueBatchRequest { UserId = userId, IssuesIds = request.IssueIds });
        }

        return MapToDetailDto(sprint, issues);
    }

    public async Task<SprintWithIssuesDto> GetSprintByIdAsync(long userId, long id, long? projectId = null)
    {
        if (id == 0)
        {
            if (!projectId.HasValue)
                throw new ArgumentException("ProjectId is required when retrieving backlog (id=0)");

            return await GetBacklogByProjectIdAsync(userId, projectId.Value);
        }

        var sprint = await _sprintRepository.GetByIdAsync(id);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {id} not found");

        await _authService.HasPermissionAsync(userId, sprint.ProjectId,
            Cache.EntityType.SPRINT, Cache.ActionType.VIEW);

        var issueIds = await _sprintIssueService.GetIssueIdsBySprintIdAsync(id);
        var issues = new List<InternalIssueResponse>();
        if (issueIds.Any())
        {
            issues = await _issueClient.GetIssuesByIds(new IssueBatchRequest { UserId = userId, IssuesIds = issueIds });
        }

        return MapToDetailDto(sprint, issues);
    }

    private async Task<SprintWithIssuesDto> GetBacklogByProjectIdAsync(long userId, long projectId)
    {
        await _authService.HasPermissionAsync(userId, projectId,
            Cache.EntityType.SPRINT, Cache.ActionType.VIEW);

        try
        {
            await _projectClient.GetProjectByIdAsync(projectId);
        }
        catch (ApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException($"Project with id {projectId} not found");
        }

        var sprints = await _sprintRepository.GetByProjectIdAsync(projectId);
        var allIssues = await _issueClient.GetIssuesByProjectId(projectId);

        var allAssignedIssueIds = new HashSet<long>();
        foreach (var sprint in sprints)
        {
            var issueIds = await _sprintIssueService.GetIssueIdsBySprintIdAsync(sprint.Id);
            allAssignedIssueIds.UnionWith(issueIds);
        }

        var backLogIssues = allIssues.Where(i => !allAssignedIssueIds.Contains(i.Id)).ToList();

        return new SprintWithIssuesDto
        {
            Id = 0,
            ProjectId = projectId,
            Name = "BackLog",
            Goal = null,
            StartDate = null,
            EndDate = null,
            Status = SprintStatus.Planned,
            IssueCount = backLogIssues.Count,
            Issues = backLogIssues
        };
    }

    public async Task<ProjectSprintsDto> GetSprintsByProjectIdAsync(long userId, long projectId)
    {
        await _authService.HasPermissionAsync(userId, projectId,
            Cache.EntityType.SPRINT, Cache.ActionType.VIEW);
        try
        {
            await _projectClient.GetProjectByIdAsync(projectId);
        }
        catch (ApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException($"Project with id {projectId} not found");
        }

        var sprints = await _sprintRepository.GetByProjectIdAsync(projectId);

        var allIssues = await _issueClient.GetIssuesByProjectId(projectId);

        var sprintIssueMap = new Dictionary<long, List<long>>();
        var allAssignedIssueIds = new HashSet<long>();

        foreach (var sprint in sprints)
        {
            var issueIds = await _sprintIssueService.GetIssueIdsBySprintIdAsync(sprint.Id);
            sprintIssueMap[sprint.Id] = issueIds;
            allAssignedIssueIds.UnionWith(issueIds);
        }

        var result = new ProjectSprintsDto { ProjectId = projectId };

        foreach (var sprint in sprints)
        {
            var issueIds = sprintIssueMap[sprint.Id];
            var issues = allIssues.Where(i => issueIds.Contains(i.Id)).ToList();

            result.Sprints.Add(new SprintWithIssuesDto
            {
                Id = sprint.Id,
                ProjectId = sprint.ProjectId,
                Name = sprint.Name,
                Goal = sprint.Goal,
                StartDate = sprint.StartDate,
                EndDate = sprint.EndDate,
                Status = sprint.Status,
                IssueCount = issues.Count,
                Issues = issues
            });
        }

        var backLogIssues = allIssues.Where(i => !allAssignedIssueIds.Contains(i.Id)).ToList();
        if (backLogIssues.Any())
        {
            result.Sprints.Add(new SprintWithIssuesDto
            {
                Id = 0,
                ProjectId = projectId,
                Name = "BackLog",
                Goal = null,
                StartDate = null,
                EndDate = null,
                Status = SprintStatus.Planned,
                IssueCount = backLogIssues.Count,
                Issues = backLogIssues
            });
        }

        return result;
    }

    public async Task<SprintDto> UpdateSprintAsync(long userId, long id, UpdateSprintRequestDto request)
    {
        var sprint = await _sprintRepository.GetByIdAsync(id);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {id} not found");
        await _authService.HasPermissionAsync(userId, sprint.ProjectId,
            Cache.EntityType.SPRINT, Cache.ActionType.MANAGE);

        // Валидировать даты
        var startDate = request.StartDate ?? sprint.StartDate;
        var endDate = request.EndDate ?? sprint.EndDate;
        if (startDate >= endDate)
            throw new ArgumentException("Start date must be before end date");

        // Обновить
        sprint.Name = request.Name;
        sprint.Goal = request.Goal;
        sprint.StartDate = startDate;
        sprint.EndDate = endDate;

        await _sprintRepository.UpdateAsync(sprint);

        var issueCount = await _sprintIssueService.GetIssueCountBySprintIdAsync(id);
        return MapToDto(sprint, issueCount);
    }

    public async Task DeleteSprintAsync(long userId, long id)
    {
        var sprint = await _sprintRepository.GetByIdAsync(id);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {id} not found");
        await _authService.HasPermissionAsync(userId, sprint.ProjectId,
            Cache.EntityType.SPRINT, Cache.ActionType.MANAGE);

        await _sprintIssueService.ClearAllIssuesFromSprintAsync(id);
        await _sprintRepository.DeleteAsync(id);
        _logger.LogInformation("Deleted sprint {SprintId}", id);
    }

    public async Task<SprintWithIssuesDto> StartSprintAsync(long userId, long sprintId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {sprintId} not found");

        await _authService.HasPermissionAsync(userId, sprint.ProjectId,
            Cache.EntityType.SPRINT, Cache.ActionType.MANAGE);

        if (sprint.EndDate == default)
            throw new InvalidOperationException("Cannot start sprint without EndDate");

        sprint.Status = SprintStatus.Active;
        sprint.StartDate = DateTime.UtcNow;
        await _sprintRepository.UpdateAsync(sprint);

        var issueIds = await _sprintIssueService.GetIssueIdsBySprintIdAsync(sprintId);
        List<InternalIssueResponse> issues = new List<InternalIssueResponse>();

        if (issueIds.Any())
        {
            issues = await _issueClient.StartSprint(sprint.ProjectId,
                new IssueBatchRequest { UserId = userId, IssuesIds = issueIds });
        }

        return MapToDetailDto(sprint, issues);
    }

    private SprintDto MapToDto(Sprint sprint, int issueCount)
    {
        return new SprintDto
        {
            Id = sprint.Id,
            ProjectId = sprint.ProjectId,
            Name = sprint.Name,
            Goal = sprint.Goal,
            StartDate = sprint.StartDate,
            EndDate = sprint.EndDate,
            Status = sprint.Status,
            IssueCount = issueCount
        };
    }

    private SprintWithIssuesDto MapToDetailDto(Sprint sprint, List<InternalIssueResponse> issues)
    {
        return new SprintWithIssuesDto
        {
            Id = sprint.Id,
            ProjectId = sprint.ProjectId,
            Name = sprint.Name,
            Goal = sprint.Goal,
            StartDate = sprint.StartDate,
            EndDate = sprint.EndDate,
            Status = sprint.Status,
            IssueCount = issues?.Count ?? 0,
            Issues = issues ?? new List<InternalIssueResponse>()
        };
    }
}