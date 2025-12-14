using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class ProjectMemberRemovedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("removedUserId")]
    public long RemovedUserId { get; set; }

    [JsonPropertyName("removedByUserId")]
    public long RemovedByUserId { get; set; }

    [JsonPropertyName("removedAtUtc")]
    public DateTime RemovedAtUtc { get; set; } = DateTime.UtcNow;
}