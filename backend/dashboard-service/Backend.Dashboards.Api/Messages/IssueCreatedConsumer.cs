using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueCreatedConsumer : IConsumer<IssueCreatedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueCreatedConsumer> _logger;

        public IssueCreatedConsumer(IActivityLogService activityLogService, ILogger<IssueCreatedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueCreatedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueCreatedEvent for IssueId: {IssueId}", @event.IssueId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.CreatorId,
                "Created",
                "Issue",
                @event.IssueId
            );
        }
    }
}
