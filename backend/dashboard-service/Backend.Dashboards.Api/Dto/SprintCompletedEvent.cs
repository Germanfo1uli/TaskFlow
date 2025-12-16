using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class SprintCompletedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("sprintId")]
    public long SprintId { get; set; }

    [JsonPropertyName("completerId")]
    public long CompleterId { get; set; }

    [JsonPropertyName("completedAtUtc")]
    public DateTimeOffset CompletedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}