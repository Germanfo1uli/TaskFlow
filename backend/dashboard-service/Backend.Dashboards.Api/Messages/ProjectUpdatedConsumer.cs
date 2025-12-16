using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class ProjectUpdatedConsumer : IConsumer<ProjectUpdatedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<ProjectUpdatedConsumer> _logger;

        public ProjectUpdatedConsumer(IActivityLogService activityLogService, ILogger<ProjectUpdatedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<ProjectUpdatedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received ProjectUpdatedEvent for ProjectId: {ProjectId}", @event.ProjectId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.UpdaterId,
                "Updated",
                "Project",
                @event.ProjectId
            );
        }
    }
}
