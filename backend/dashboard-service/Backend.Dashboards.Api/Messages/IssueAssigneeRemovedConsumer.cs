using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueAssigneeRemovedConsumer : IConsumer<IssueAssigneeRemovedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueAssigneeRemovedConsumer> _logger;

        public IssueAssigneeRemovedConsumer(IActivityLogService activityLogService, ILogger<IssueAssigneeRemovedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueAssigneeRemovedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueAssigneeRemovedEvent for IssueId: {IssueId}", @event.IssueId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.RemoverId,
                "Removed",
                "IssueAssignee",
                @event.RemovedUserId
            );
        }
    }
}
