using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class IssuePriorityChangedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("updaterId")]
    public long UpdaterId { get; set; }

    [JsonPropertyName("oldPriority")]
    public string OldPriority { get; set; } = string.Empty;

    [JsonPropertyName("newPriority")]
    public string NewPriority { get; set; } = string.Empty;

    [JsonPropertyName("changedAtUtc")]
    public DateTime ChangedAtUtc { get; set; } = DateTime.UtcNow;
}