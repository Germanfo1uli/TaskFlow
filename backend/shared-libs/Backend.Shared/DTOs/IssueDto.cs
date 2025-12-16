namespace Backend.Shared.DTOs
{
    public class IssueBatchRequest
    {
        public long UserId { get; set; }
        public List<long> IssuesIds { get; set; } = new();
    }
}