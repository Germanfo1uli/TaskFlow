using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class SprintIssueRemovedConsumer : IConsumer<SprintIssueRemovedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<SprintIssueRemovedConsumer> _logger;

        public SprintIssueRemovedConsumer(IActivityLogService activityLogService, ILogger<SprintIssueRemovedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<SprintIssueRemovedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received SprintIssueRemovedEvent for IssueId: {IssueId}", @event.IssueId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.RemovedByUserId,
                "Removed",
                "SprintIssue",
                @event.IssueId
            );
        }
    }
}
