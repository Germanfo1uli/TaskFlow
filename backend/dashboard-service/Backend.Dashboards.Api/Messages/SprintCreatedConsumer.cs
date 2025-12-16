using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class SprintCreatedConsumer : IConsumer<SprintCreatedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<SprintCreatedConsumer> _logger;

        public SprintCreatedConsumer(IActivityLogService activityLogService, ILogger<SprintCreatedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<SprintCreatedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received SprintCreatedEvent for SprintId: {SprintId}", @event.SprintId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.CreatorId,
                "Created",
                "Sprint",
                @event.SprintId
            );
        }
    }
}
