namespace Backend.Shared.DTOs;

public class SprintDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public long ProjectId { get; set; }
	public SprintStatus Status { get; set; }
}

public class RemoveIssuesRequestDto
{
    public List<long> IssueIds { get; set; } = new();
}

public class AddIssueRequest
{
    public long IssueId { get; set; }
}

public enum SprintStatus
{
    Planned,
    Active, 
    Completed
}