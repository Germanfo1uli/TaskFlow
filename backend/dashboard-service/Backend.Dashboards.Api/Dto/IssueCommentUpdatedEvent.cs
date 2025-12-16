using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class IssueCommentUpdatedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("commentId")]
    public long CommentId { get; set; }

    [JsonPropertyName("editorId")]
    public long EditorId { get; set; }

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}