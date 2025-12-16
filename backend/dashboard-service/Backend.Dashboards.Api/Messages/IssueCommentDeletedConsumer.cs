using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueCommentDeletedConsumer : IConsumer<IssueCommentDeletedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueCommentDeletedConsumer> _logger;

        public IssueCommentDeletedConsumer(IActivityLogService activityLogService, ILogger<IssueCommentDeletedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueCommentDeletedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueCommentDeletedEvent for CommentId: {CommentId}", @event.CommentId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.DeleterId,
                "Deleted",
                "IssueComment",
                @event.CommentId
            );
        }
    }
}
