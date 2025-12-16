using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class IssueCommentCreatedConsumer : IConsumer<IssueCommentCreatedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<IssueCommentCreatedConsumer> _logger;

        public IssueCommentCreatedConsumer(IActivityLogService activityLogService, ILogger<IssueCommentCreatedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<IssueCommentCreatedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received IssueCommentCreatedEvent for CommentId: {CommentId}", @event.CommentId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.AuthorId,
                "Created",
                "IssueComment",
                @event.CommentId
            );
        }
    }
}
