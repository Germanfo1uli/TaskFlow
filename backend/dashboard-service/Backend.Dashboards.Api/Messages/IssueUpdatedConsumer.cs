using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueUpdatedConsumer : IConsumer<IssueUpdatedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueUpdatedConsumer> _logger;

        public IssueUpdatedConsumer(IActivityLogService activityLogService, ILogger<IssueUpdatedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueUpdatedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueUpdatedEvent for IssueId: {IssueId}", @event.IssueId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.UpdaterId,
                "Updated",
                "Issue",
                @event.IssueId
            );
        }
    }
}
