using Microsoft.EntityFrameworkCore;
using Backend.Sprints.Api.Models.Entities;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Data;

public class SprintsDbContext : DbContext
{
    public SprintsDbContext(DbContextOptions<SprintsDbContext> options) : base(options)
    {
    }

    public DbSet<Sprint> Sprints { get; set; }
    public DbSet<SprintIssue> SprintIssues { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("sprints_service_schema");
        
        modelBuilder.Entity<Sprint>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            
        	entity.Property(e => e.Status)
            	.HasConversion<string>()
            	.HasMaxLength(50)
            	.HasDefaultValue(SprintStatus.Planned);
            
            entity.HasIndex(e => e.ProjectId);
            entity.HasIndex(e => e.StartDate);
            entity.HasIndex(e => e.EndDate);
            entity.HasIndex(e => e.Status);

            entity.HasMany(s => s.SprintIssues)
                  .WithOne(si => si.Sprint)
                  .HasForeignKey(si => si.SprintId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SprintIssue>(entity =>
        {
            entity.HasKey(e => new { e.IssueId, e.SprintId });
            
            entity.HasIndex(e => e.SprintId);
            entity.HasIndex(e => e.IssueId);
        });
    }
}