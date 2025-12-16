using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class ProjectUpdatedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("updaterId")]
    public long UpdaterId { get; set; }

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}