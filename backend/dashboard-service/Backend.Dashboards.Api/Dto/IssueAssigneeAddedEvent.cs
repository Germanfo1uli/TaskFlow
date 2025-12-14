using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class IssueAssigneeAddedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("assignedUserId")]
    public long AssignedUserId { get; set; }

    [JsonPropertyName("assignerId")]
    public long AssignerId { get; set; }

    [JsonPropertyName("assignedAtUtc")]
    public DateTime AssignedAtUtc { get; set; } = DateTime.UtcNow;
}