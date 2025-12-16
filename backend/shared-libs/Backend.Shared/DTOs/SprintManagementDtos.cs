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
    }

    public class AddIssuesRequestDto
    {
        public List<long> IssueIds { get; set; } = new();
    }

    public class SprintDto
    {
        public long Id { get; set; }
        public long ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public SprintStatus Status { get; set; }
        public int IssueCount { get; set; }
    }

    public class InternalIssueResponse
    {
        public long Id { get; set; }
        public long? AssigneeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public IssueStatus Status { get; set; }
        public IssueType Type { get; set; }
        public Priority Priority { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public enum IssueStatus
    {
        TO_DO, SELECTED_FOR_DEVELOPMENT, IN_PROGRESS, CODE_REVIEW, QA, STAGING, DONE
    }

    public enum IssueType
    {
        TASK, BUG, STORY, EPIC, SUB_TASK
    }

    public enum Priority
    {
        DEFERRED, LOW, MEDIUM, HIGH, MAJOR, CRITICAL
    }

    public enum SprintStatus
    {
        Planned, Active, Completed
    }

    public class ProjectSprintsDto
    {
        public long ProjectId { get; set; }
        public List<SprintWithIssuesDto> Sprints { get; set; } = new();
    }

    public class SprintWithIssuesDto
    {
        public long Id { get; set; }
        public long ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public SprintStatus Status { get; set; }
        public long IssueCount { get; set; }
        public List<InternalIssueResponse> Issues { get; set; } = new();
    }
}