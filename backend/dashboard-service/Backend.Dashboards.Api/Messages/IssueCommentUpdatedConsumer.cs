using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueCommentUpdatedConsumer : IConsumer<IssueCommentUpdatedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueCommentUpdatedConsumer> _logger;

        public IssueCommentUpdatedConsumer(IActivityLogService activityLogService, ILogger<IssueCommentUpdatedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueCommentUpdatedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueCommentUpdatedEvent for CommentId: {CommentId}", @event.CommentId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.EditorId,
                "Updated",
                "IssueComment",
                @event.CommentId
            );
        }
    }
}
