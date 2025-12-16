using Microsoft.EntityFrameworkCore;
using Backend.Sprints.Api.Models.Entities;

namespace Backend.Sprints.Api.Data.Repositories;

public class SprintIssueRepository
{
    private readonly SprintsDbContext _context;

    public SprintIssueRepository(SprintsDbContext context)
    {
        _context = context;
    }

    public async Task AddIssuesToSprintAsync(long sprintId, List<long> issueIds)
    {
        var existing = await GetIssueIdsBySprintIdAsync(sprintId);
        var newIds = issueIds.Except(existing).ToList();
        if (!newIds.Any()) return;

        var sprintIssues = newIds.Select(id => new SprintIssue
        {
            SprintId = sprintId,
            IssueId = id
        }).ToList();

        _context.SprintIssues.AddRange(sprintIssues);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveIssueFromSprintAsync(long sprintId, long issueId)
    {
        await _context.SprintIssues
            .Where(si => si.SprintId == sprintId && si.IssueId == issueId)
            .ExecuteDeleteAsync();
    }

    public async Task RemoveIssuesFromAllSprintsAsync(List<long> issueIds)
    {
        await _context.SprintIssues
            .Where(si => issueIds.Contains(si.IssueId))
            .ExecuteDeleteAsync();
    }

    public async Task<List<long>> GetIssueIdsBySprintIdAsync(long sprintId)
    {
        return await _context.SprintIssues
            .Where(si => si.SprintId == sprintId)
            .Select(si => si.IssueId)
            .ToListAsync();
    }

    public async Task<int> GetIssueCountBySprintIdAsync(long sprintId)
    {
        return await _context.SprintIssues
            .CountAsync(si => si.SprintId == sprintId);
    }

    public async Task ClearAllIssuesFromSprintAsync(long sprintId)
    {
        await _context.SprintIssues
            .Where(si => si.SprintId == sprintId)
            .ExecuteDeleteAsync();
    }

    public async Task<bool> IsIssueInSprintAsync(long sprintId, long issueId)
    {
        return await _context.SprintIssues
            .AnyAsync(si => si.SprintId == sprintId && si.IssueId == issueId);
    }
}