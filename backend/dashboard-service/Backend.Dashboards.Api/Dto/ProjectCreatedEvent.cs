using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class ProjectCreatedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("projectName")]
    public string ProjectName { get; set; } = string.Empty;

    [JsonPropertyName("creatorId")]
    public long CreatorId { get; set; }

    [JsonPropertyName("createdAtUtc")]
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}