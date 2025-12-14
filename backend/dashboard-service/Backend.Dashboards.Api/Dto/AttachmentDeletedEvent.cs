using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class AttachmentDeletedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("attachmentId")]
    public long AttachmentId { get; set; }

    [JsonPropertyName("deleterId")]
    public long DeleterId { get; set; }

    [JsonPropertyName("deletedAtUtc")]
    public DateTimeOffset DeletedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}