using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueDeletedConsumer : IConsumer<IssueDeletedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueDeletedConsumer> _logger;

        public IssueDeletedConsumer(IActivityLogService activityLogService, ILogger<IssueDeletedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueDeletedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueDeletedEvent for IssueId: {IssueId}", @event.IssueId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.DeleterId,
                "Deleted",
                "Issue",
                @event.IssueId
            );
        }
    }
}
