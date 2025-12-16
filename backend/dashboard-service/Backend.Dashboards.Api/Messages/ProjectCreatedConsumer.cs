using Backend.Dashboard.Api.Services;
using MassTransit;
using Backend.Shared.DTOs;

namespace Backend.Dashboard.Api.Messages
{
    public class ProjectCreatedConsumer : IConsumer<ProjectCreatedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<ProjectCreatedConsumer> _logger;

        public ProjectCreatedConsumer(IActivityLogService activityLogService, ILogger<ProjectCreatedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<ProjectCreatedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received ProjectCreatedEvent for ProjectId: {ProjectId}", @event.ProjectId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.CreatorId,
                "Created",
                "Project",
                @event.ProjectId
            );
        }
    }
}
