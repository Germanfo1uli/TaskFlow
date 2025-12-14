using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class IssueDeletedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("deleterId")]
    public long DeleterId { get; set; }

    [JsonPropertyName("deletedAtUtc")]
    public DateTime DeletedAtUtc { get; set; } = DateTime.UtcNow;
}