using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class IssueTypeChangedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("updaterId")]
    public long UpdaterId { get; set; }

    [JsonPropertyName("oldType")]
    public string OldType { get; set; } = string.Empty;

    [JsonPropertyName("newType")]
    public string NewType { get; set; } = string.Empty;

    [JsonPropertyName("changedAtUtc")]
    public DateTime ChangedAtUtc { get; set; } = DateTime.UtcNow;
}