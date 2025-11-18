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

public enum SprintStatus
{
    Planned,
    Active, 
    Completed
}