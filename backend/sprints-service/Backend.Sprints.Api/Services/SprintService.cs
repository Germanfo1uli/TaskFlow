﻿using Backend.Sprints.Api.Clients;
using Backend.Sprints.Api.Data.Repositories;
using Backend.Sprints.Api.Models.Entities;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Services;

public class SprintService : ISprintService
{
    private readonly SprintRepository _sprintRepository;
    private readonly ISprintIssueService _sprintIssueService;
    private readonly IIssueClient _issueClient;
    private readonly IInternalApiClient _internalApiClient;

    public SprintService(
        SprintRepository sprintRepository, 
        ISprintIssueService sprintIssueService,
        IIssueClient issueClient,
        IInternalApiClient internalApiClient)
    {
        _sprintRepository = sprintRepository;
        _sprintIssueService = sprintIssueService;
        _issueClient = issueClient;
        _internalApiClient = internalApiClient;
    }

    public async Task<Sprint> CreateSprintAsync(long projectId, string name, string? goal, DateTime startDate, DateTime endDate)
    {
        return await CreateSprintInternalAsync(projectId, name, goal, startDate, endDate);
    }

    public async Task<Sprint> CreateSprintWithIssuesAsync(long projectId, CreateSprintRequestDto request)
    {
        var projectResponse = await _internalApiClient.GetProjectByIdAsync(projectId);
        if (!projectResponse.IsSuccessStatusCode)
            throw new KeyNotFoundException($"Project with id {projectId} not found");

        var startDate = request.StartDate ?? DateTime.UtcNow.Date;
        var endDate = request.EndDate ?? startDate.AddDays(14);
        
        var sprint = await CreateSprintInternalAsync(projectId, request.Name, request.Goal, startDate, endDate);
        
        if (request.IssueIds != null && request.IssueIds.Any())
        {
            await AddIssuesToSprintAsync(sprint.Id, request.IssueIds);
        }
        
        return sprint;
    }

    private async Task<Sprint> CreateSprintInternalAsync(long projectId, string name, string? goal, DateTime startDate, DateTime endDate)
    {
        if (startDate >= endDate)
            throw new ArgumentException("Start date must be before end date");

        if (await _sprintRepository.HasDateOverlapAsync(projectId, startDate, endDate))
            throw new InvalidOperationException("Sprint dates overlap with existing sprint in project");

        var sprint = new Sprint
        {
            ProjectId = projectId,
            Name = name,
            Goal = goal,
            StartDate = startDate,
            EndDate = endDate,
            Status = SprintStatus.Planned
        };

        return await _sprintRepository.CreateAsync(sprint);
    }

    public async Task AddIssuesToSprintAsync(long sprintId, List<long> issueIds)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {sprintId} not found");

        foreach (var issueId in issueIds)
        {
            var issueResponse = await _internalApiClient.IssueExistsAsync(issueId);
            if (!issueResponse.IsSuccessStatusCode || !issueResponse.Content)
                throw new KeyNotFoundException($"Issue with id {issueId} not found");
            
            await _sprintIssueService.AddIssueToSprintAsync(sprintId, issueId);
        }
    }

    public async Task<Sprint> UpdateSprintAsync(long id, string name, string? goal, DateTime? startDate, DateTime? endDate, SprintStatus status)
    {
        var sprint = await _sprintRepository.GetByIdAsync(id);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {id} not found");

        sprint.Name = name;
        sprint.Goal = goal;
        sprint.Status = status;

        if (startDate.HasValue)
            sprint.StartDate = startDate.Value;
        
        if (endDate.HasValue)
            sprint.EndDate = endDate.Value;

        if (sprint.StartDate >= sprint.EndDate)
            throw new ArgumentException("Start date must be before end date");

        if (await _sprintRepository.HasDateOverlapAsync(sprint.ProjectId, sprint.StartDate, sprint.EndDate, id))
            throw new InvalidOperationException("Sprint dates overlap with existing sprint in project");

        return await _sprintRepository.UpdateAsync(sprint);
    }

    public async Task StartSprintAsync(long sprintId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {sprintId} not found");

        if (sprint.EndDate == default)
            throw new InvalidOperationException("Cannot start sprint without EndDate");

        var issueIds = await _sprintIssueService.GetIssueIdsBySprintIdAsync(sprintId);
    
        if (issueIds.Any())
        {
            var request = new IssueBatchRequest { IssuesIds = issueIds };
            await _issueClient.StartSprint(sprint.ProjectId, request);
        }

        sprint.Status = SprintStatus.Active;
        sprint.StartDate = DateTime.UtcNow;

        await _sprintRepository.UpdateAsync(sprint);
    }

    public async Task<ProjectSprintsDto> GetProjectSprintsWithIssuesAsync(long projectId)
    {
        var projectResponse = await _internalApiClient.GetProjectByIdAsync(projectId);
        if (!projectResponse.IsSuccessStatusCode)
            throw new KeyNotFoundException($"Project with id {projectId} not found");

        var sprints = await _sprintRepository.GetByProjectIdAsync(projectId);
        
        List<InternalIssueResponse> allProjectIssues;
        try
        {
            allProjectIssues = await _issueClient.GetIssuesByProjectId(projectId);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to fetch issues for project {projectId}: {ex.Message}", ex);
        }
        
        var sprintIssuesMap = new Dictionary<long, List<long>>();
        foreach (var sprint in sprints)
        {
            var issueIds = await _sprintIssueService.GetIssueIdsBySprintIdAsync(sprint.Id);
            sprintIssuesMap[sprint.Id] = issueIds;
        }

        var result = new ProjectSprintsDto
        {
            ProjectId = projectId
        };

        foreach (var sprint in sprints)
        {
            var sprintDto = new SprintWithIssuesDto
            {
                Id = sprint.Id,
                Name = sprint.Name,
                Goal = sprint.Goal,
                StartDate = sprint.StartDate,
                EndDate = sprint.EndDate,
                Status = sprint.Status
            };

            if (sprintIssuesMap.TryGetValue(sprint.Id, out var issueIds))
            {
                sprintDto.Issues = allProjectIssues
                    .Where(issue => issueIds.Contains(issue.Id))
                    .ToList();
            }

            result.Sprints.Add(sprintDto);
        }

        var allIssuesInSprints = sprintIssuesMap.Values.SelectMany(x => x).ToHashSet();
        var backlogIssues = allProjectIssues
            .Where(issue => !allIssuesInSprints.Contains(issue.Id))
            .ToList();

        var backlogSprint = new SprintWithIssuesDto
        {
            Id = 0,
            Name = "BACKLOG",
            Goal = "Tasks not assigned to any sprint",
            StartDate = null,
            EndDate = null,
            Status = SprintStatus.Planned,
            Issues = backlogIssues
        };

        result.Sprints.Add(backlogSprint);

        return result;
    }

    public async Task<Sprint?> GetSprintByIdAsync(long id)
    {
        return await _sprintRepository.GetByIdAsync(id);
    }

    public async Task<List<Sprint>> GetSprintsByProjectIdAsync(long projectId)
    {
        var projectResponse = await _internalApiClient.ProjectExistsAsync(projectId);
        if (!projectResponse.IsSuccessStatusCode || !projectResponse.Content)
            throw new KeyNotFoundException($"Project with id {projectId} not found");
        
        return await _sprintRepository.GetByProjectIdAsync(projectId);
    }

    public async Task DeleteSprintAsync(long id)
    {
        await _sprintRepository.DeleteAsync(id);
    }

    public async Task CompleteSprintAsync(long sprintId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {sprintId} not found");

        sprint.Status = SprintStatus.Completed;
        await _sprintRepository.UpdateAsync(sprint);
    }

    public async Task<SprintBoardDto> GetSprintBoardAsync(long sprintId)
    {
        var sprint = await _sprintRepository.GetByIdAsync(sprintId);
        if (sprint == null)
            throw new KeyNotFoundException($"Sprint with id {sprintId} not found");

        var issueIds = await _sprintIssueService.GetIssueIdsBySprintIdAsync(sprintId);
        
        var issues = new List<InternalIssueResponse>();
        foreach (var issueId in issueIds)
        {
            try
            {
                var issue = await _issueClient.GetIssueById(issueId);
                issues.Add(issue);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching issue {issueId}: {ex.Message}");
            }
        }

        return new SprintBoardDto
        {
            SprintId = sprintId,
            SprintName = sprint.Name,
            Issues = issues
        };
    }

    public async Task<bool> HasDateOverlapAsync(long projectId, DateTime startDate, DateTime endDate, long? excludeSprintId = null)
    {
        return await _sprintRepository.HasDateOverlapAsync(projectId, startDate, endDate, excludeSprintId);
    }
}