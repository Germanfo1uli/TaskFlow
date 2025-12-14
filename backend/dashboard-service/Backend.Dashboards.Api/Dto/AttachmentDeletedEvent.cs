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

    [JsonPropertyName("DeletedAtUtc")]
    public DateTime DeletedAtUtc { get; set; } = DateTime.UtcNow;
}