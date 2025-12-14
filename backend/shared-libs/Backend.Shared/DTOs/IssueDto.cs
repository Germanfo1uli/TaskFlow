namespace Backend.Shared.DTOs
{
    public class InternalIssueResponse
    {
        public long Id { get; set; }
        public long AssigneeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public IssueStatus Status { get; set; }
        public IssueType Type { get; set; }
        public Priority Priority { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
    
    public class IssueBatchRequest
    {
        public List<long> IssuesIds { get; set; } = new();
    }

    public enum IssueStatus
    {
        TO_DO,
        SELECTED_FOR_DEVELOPMENT,
        IN_PROGRESS,
        CODE_REVIEW,
        QA,
        STAGING,
        DONE
    }

    public enum IssueType
    {
        TASK,
        BUG,
        STORY,
        EPIC,
        SUB_TASK
    }

    public enum Priority
    {
        DEFERRED,
        LOW,
        MEDIUM,
        HIGH,
        MAJOR,
        CRITICAL
    }
}