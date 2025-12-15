using System.Collections.Generic;

namespace Backend.Shared.DTOs
{
    public class CreateSprintRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<long>? IssueIds { get; set; }
    }

    public class UpdateSprintRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public SprintStatus Status { get; set; }
    }

    public class AddIssuesRequestDto
    {
        public List<long> IssueIds { get; set; } = new();
    }

    public class ProjectSprintsDto
    {
        public long ProjectId { get; set; }
        public List<SprintWithIssuesDto> Sprints { get; set; } = new();
    }

    public class SprintWithIssuesDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public SprintStatus Status { get; set; }
        public List<InternalIssueResponse> Issues { get; set; } = new();
    }
}