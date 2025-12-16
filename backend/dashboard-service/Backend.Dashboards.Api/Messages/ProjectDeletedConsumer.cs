using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class ProjectDeletedConsumer : IConsumer<ProjectDeletedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<ProjectDeletedConsumer> _logger;

        public ProjectDeletedConsumer(IActivityLogService activityLogService, ILogger<ProjectDeletedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<ProjectDeletedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received ProjectDeletedEvent for ProjectId: {ProjectId}", @event.ProjectId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.DeleterId,
                "Deleted",
                "Project",
                @event.ProjectId
            );
        }
    }
}
