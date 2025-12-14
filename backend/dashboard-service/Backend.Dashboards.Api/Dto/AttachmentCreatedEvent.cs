using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class AttachmentCreatedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("commentId")]
    public long? CommentId { get; set; }

    [JsonPropertyName("attachmentId")]
    public long AttachmentId { get; set; }

    [JsonPropertyName("uploaderId")]
    public long UploaderId { get; set; }

    [JsonPropertyName("createdAtUtc")]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}