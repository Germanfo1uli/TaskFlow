using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class SprintCreatedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("sprintId")]
    public long SprintId { get; set; }

    [JsonPropertyName("creatorId")]
    public long CreatorId { get; set; }

    [JsonPropertyName("createdAtUtc")]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}