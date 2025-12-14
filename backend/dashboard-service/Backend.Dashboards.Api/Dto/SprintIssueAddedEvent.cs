using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class SprintIssueAddedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("sprintId")]
    public long SprintId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("addedByUserId")]
    public long AddedByUserId { get; set; }

    [JsonPropertyName("addedAtUtc")]
    public DateTime AddedAtUtc { get; set; } = DateTime.UtcNow;
}