using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class IssueAssigneeRemovedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("removedUserId")]
    public long RemovedUserId { get; set; }

    [JsonPropertyName("removerId")]
    public long RemoverId { get; set; }

    [JsonPropertyName("removedAtUtc")]
    public DateTimeOffset RemovedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}