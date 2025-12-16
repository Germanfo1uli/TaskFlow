using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class AttachmentDeletedConsumer : IConsumer<AttachmentDeletedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<AttachmentDeletedConsumer> _logger;

        public AttachmentDeletedConsumer(IActivityLogService activityLogService, ILogger<AttachmentDeletedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<AttachmentDeletedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received AttachmentDeletedEvent for AttachmentId: {AttachmentId}", @event.AttachmentId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.DeleterId,
                "Deleted",
                "Attachment",
                @event.AttachmentId
            );
        }
    }
}
