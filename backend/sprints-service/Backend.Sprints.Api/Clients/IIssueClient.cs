using Refit;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Clients
{
    public interface IIssueClient
    {
        [Get("/api/internal/issues/{issueId}")]
        Task<InternalIssueResponse> GetIssueById(long issueId);

        [Get("/api/internal/issues")]
        Task<List<InternalIssueResponse>> GetIssuesByProjectId([Query] long projectId);

        [Post("/api/internal/issues")]
        Task<List<InternalIssueResponse>> StartSprint([Query] long projectId, [Body] IssueBatchRequest issuesIds);
    }
}