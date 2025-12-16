using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class SprintStartedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("sprintId")]
    public long SprintId { get; set; }

    [JsonPropertyName("starterId")]
    public long StarterId { get; set; }

    [JsonPropertyName("startedAtUtc")]
    public DateTimeOffset StartedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}