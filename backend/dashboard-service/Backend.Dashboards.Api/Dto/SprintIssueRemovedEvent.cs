using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class SprintIssueRemovedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("sprintId")]
    public long SprintId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("removedByUserId")]
    public long RemovedByUserId { get; set; }

    [JsonPropertyName("RemovedAtUtc")]
    public DateTimeOffset RemovedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}