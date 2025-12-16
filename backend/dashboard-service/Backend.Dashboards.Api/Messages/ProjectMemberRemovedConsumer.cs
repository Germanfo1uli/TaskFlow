using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class ProjectMemberRemovedConsumer : IConsumer<ProjectMemberRemovedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<ProjectMemberRemovedConsumer> _logger;

        public ProjectMemberRemovedConsumer(IActivityLogService activityLogService, ILogger<ProjectMemberRemovedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<ProjectMemberRemovedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received ProjectMemberRemovedEvent for ProjectId: {ProjectId}", @event.ProjectId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.RemovedByUserId,
                "Removed",
                "ProjectMember",
                @event.RemovedUserId
            );
        }
    }
}
