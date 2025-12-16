using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class SprintIssueAddedConsumer : IConsumer<SprintIssueAddedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<SprintIssueAddedConsumer> _logger;

        public SprintIssueAddedConsumer(IActivityLogService activityLogService, ILogger<SprintIssueAddedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<SprintIssueAddedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received SprintIssueAddedEvent for IssueId: {IssueId}", @event.IssueId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.AddedByUserId,
                "Added",
                "SprintIssue",
                @event.IssueId
            );
        }
    }
}
