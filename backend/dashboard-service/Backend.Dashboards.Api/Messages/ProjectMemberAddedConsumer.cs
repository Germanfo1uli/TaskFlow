using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class ProjectMemberAddedConsumer : IConsumer<ProjectMemberAddedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<ProjectMemberAddedConsumer> _logger;

        public ProjectMemberAddedConsumer(IActivityLogService activityLogService, ILogger<ProjectMemberAddedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<ProjectMemberAddedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received ProjectMemberAddedEvent for ProjectId: {ProjectId}", @event.ProjectId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.AddedByUserId,
                "Added",
                "ProjectMember",
                @event.AddedUserId
            );
        }
    }
}
