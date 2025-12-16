using Backend.Dashboard.Api.Services;
using Backend.Shared.DTOs;
using MassTransit;

namespace Backend.Dashboard.Api.Messages
{
    public class AttachmentCreatedConsumer : IConsumer<AttachmentCreatedEvent>
    {
        private readonly IActivityLogService _activityLogService;
        private readonly ILogger<AttachmentCreatedConsumer> _logger;

        public AttachmentCreatedConsumer(IActivityLogService activityLogService, ILogger<AttachmentCreatedConsumer> logger)
        {
            _activityLogService = activityLogService;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<AttachmentCreatedEvent> context)
        {
            var @event = context.Message;
            _logger.LogInformation("Received AttachmentCreatedEvent for AttachmentId: {AttachmentId}", @event.AttachmentId);

            await _activityLogService.LogActivityAsync(
                @event.ProjectId,
                @event.UploaderId,
                "Created",
                "Attachment",
                @event.AttachmentId
            );
        }
    }
}
