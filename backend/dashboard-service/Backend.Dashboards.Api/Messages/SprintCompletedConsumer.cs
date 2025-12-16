using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class SprintCompletedConsumer : IConsumer<SprintCompletedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<SprintCompletedConsumer> _logger;

        public SprintCompletedConsumer(IActivityLogService activityLogService, ILogger<SprintCompletedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<SprintCompletedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received SprintCompletedEvent for SprintId: {SprintId}", @event.SprintId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.CompleterId,
                "Completed",
                "Sprint",
                @event.SprintId
            );
        }
    }
}
