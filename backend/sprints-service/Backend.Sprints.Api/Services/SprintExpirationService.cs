using Backend.Shared.DTOs;
using Backend.Sprints.Api.Data.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Backend.Sprints.Api.Services;

public class SprintExpirationService : BackgroundService
{
    public const long SYSTEM_USER_ID = 0;

    private readonly ILogger<SprintExpirationService> _logger;
    private readonly IServiceProvider _services;

    public SprintExpirationService(ILogger<SprintExpirationService> logger, IServiceProvider services)
    {
        _logger = logger;
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

        await CheckAndStartScheduledSprintsAsync();
        await CheckExpiredSprintsAsync();

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await CheckAndStartScheduledSprintsAsync();
            await CheckExpiredSprintsAsync();
        }
    }

    private async Task CheckAndStartScheduledSprintsAsync()
    {
        try
        {
            using var scope = _services.CreateScope();
            var sprintService = scope.ServiceProvider.GetRequiredService<ISprintService>();
            var repository = scope.ServiceProvider.GetRequiredService<SprintRepository>();

            var sprintsToStart = await repository.GetPlannedSprintsWithStartDatePassedAsync();

            foreach (var sprint in sprintsToStart)
            {
                try
                {
                    await sprintService.StartSprintAsync(SYSTEM_USER_ID, sprint.Id);
                    _logger.LogInformation("Автоматически стартован спринт {SprintId} (проект {ProjectId})",
                        sprint.Id, sprint.ProjectId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Ошибка при автоматическом старте спринта {SprintId}", sprint.Id);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при проверке спринтов для автоматического старта");
        }
    }

    private async Task CheckExpiredSprintsAsync()
    {
        try
        {
            using var scope = _services.CreateScope();
            var repository = scope.ServiceProvider.GetRequiredService<SprintRepository>();

            var expiredSprints = await repository.GetActiveExpiredSprintsAsync();

            foreach (var sprint in expiredSprints)
            {
                sprint.Status = SprintStatus.Completed;
                await repository.UpdateAsync(sprint);
                _logger.LogInformation("Автоматически завершен спринт {SprintId} (проект {ProjectId})",
                    sprint.Id, sprint.ProjectId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при проверке истекших спринтов");
        }
    }
}