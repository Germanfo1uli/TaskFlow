using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class ProjectMemberAddedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("addedUserId")]
    public long AddedUserId { get; set; }

    [JsonPropertyName("addedByUserId")]
    public long AddedByUserId { get; set; }

    [JsonPropertyName("addedAtUtc")]
    public DateTime AddedAtUtc { get; set; } = DateTime.UtcNow;
}