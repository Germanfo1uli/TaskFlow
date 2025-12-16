using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueAssigneeAddedConsumer : IConsumer<IssueAssigneeAddedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueAssigneeAddedConsumer> _logger;

        public IssueAssigneeAddedConsumer(IActivityLogService activityLogService, ILogger<IssueAssigneeAddedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueAssigneeAddedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueAssigneeAddedEvent for IssueId: {IssueId}", @event.IssueId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.AssignerId,
                "Added",
                "IssueAssignee",
                @event.AssignedUserId 
            );
        }
    }
}
