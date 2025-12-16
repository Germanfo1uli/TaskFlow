using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class ProjectDeletedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("deleterId")]
    public long DeleterId { get; set; }

    [JsonPropertyName("deletedAtUtc")]
    public DateTimeOffset DeletedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}