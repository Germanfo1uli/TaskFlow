using Microsoft.EntityFrameworkCore;
using Backend.Sprints.Api.Models.Entities;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Data.Repositories;

public class SprintRepository
{
    private readonly SprintsDbContext _context;

    public SprintRepository(SprintsDbContext context)
    {
        _context = context;
    }

    public async Task<Sprint?> GetByIdAsync(long id)
    {
        return await _context.Sprints.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<List<Sprint>> GetByProjectIdAsync(long projectId)
    {
        return await _context.Sprints
            .AsNoTracking()
            .Where(s => s.ProjectId == projectId)
            .OrderBy(s => s.StartDate)
            .ToListAsync();
    }

    public async Task<Sprint> CreateAsync(Sprint sprint)
    {
        _context.Sprints.Add(sprint);
        await _context.SaveChangesAsync();
        return sprint;
    }

    public async Task<Sprint> UpdateAsync(Sprint sprint)
    {
        _context.Sprints.Update(sprint);
        await _context.SaveChangesAsync();
        return sprint;
    }

    public async Task DeleteAsync(long id)
    {
        var sprint = await _context.Sprints.FindAsync(id);
        if (sprint != null)
        {
            _context.Sprints.Remove(sprint);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Sprint>> GetPlannedSprintsWithStartDatePassedAsync()
    {
        var today = DateTime.UtcNow.Date;
        return await _context.Sprints
            .Where(s => s.Status == SprintStatus.Planned)
            .Where(s => s.StartDate <= today)
            .ToListAsync();
    }

    public async Task<List<Sprint>> GetActiveExpiredSprintsAsync()
    {
        var today = DateTime.UtcNow.Date;
        return await _context.Sprints
            .Where(s => s.Status == SprintStatus.Active)
            .Where(s => s.EndDate < today)
            .ToListAsync();
    }
}