using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;
using Steeltoe.Discovery.Eureka.AppInfo;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueStatusChangedConsumer : IConsumer<IssueStatusChangedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueStatusChangedConsumer> _logger;

        public IssueStatusChangedConsumer(IActivityLogService activityLogService, ILogger<IssueStatusChangedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueStatusChangedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueStatusChangedEvent for IssueId: {IssueId}", @event.IssueId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.UpdaterId,
                @event.NewStatus, 
                "Issue",
                @event.IssueId
            );
        }
    }
}
