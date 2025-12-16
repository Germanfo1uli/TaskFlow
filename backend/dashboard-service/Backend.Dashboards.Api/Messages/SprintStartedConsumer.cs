using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class SprintStartedConsumer : IConsumer<SprintStartedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<SprintStartedConsumer> _logger;

        public SprintStartedConsumer(IActivityLogService activityLogService, ILogger<SprintStartedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<SprintStartedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received SprintStartedEvent for SprintId: {SprintId}", @event.SprintId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.StarterId,
                "Started",
                "Sprint",
                @event.SprintId
            );
        }
    }
}
