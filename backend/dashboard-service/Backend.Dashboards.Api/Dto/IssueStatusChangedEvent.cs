using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class IssueStatusChangedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("updaterId")]
    public long UpdaterId { get; set; }

    [JsonPropertyName("oldStatus")]
    public string OldStatus { get; set; } = string.Empty;

    [JsonPropertyName("newStatus")]
    public string NewStatus { get; set; } = string.Empty;

    [JsonPropertyName("changedAtUtc")]
    public DateTime ChangedAtUtc { get; set; } = DateTime.UtcNow;
}