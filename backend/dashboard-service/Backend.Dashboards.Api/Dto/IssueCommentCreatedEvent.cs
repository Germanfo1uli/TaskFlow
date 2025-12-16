using System.Text.Json.Serialization;

namespace Backend.Shared.DTOs;

public class IssueCommentCreatedEvent
{
    [JsonPropertyName("projectId")]
    public long ProjectId { get; set; }

    [JsonPropertyName("issueId")]
    public long IssueId { get; set; }

    [JsonPropertyName("commentId")]
    public long CommentId { get; set; }

    [JsonPropertyName("authorId")]
    public long AuthorId { get; set; }

    [JsonPropertyName("createdAtUtc")]
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}