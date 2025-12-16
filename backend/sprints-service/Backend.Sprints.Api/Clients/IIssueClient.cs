using Refit;
using System.Threading.Tasks;
using Backend.Shared.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Sprints.Api.Clients
{
    public interface IIssueClient
    {
        [Get("/api/internal/issues/{issueId}")]
        Task<InternalIssueResponse> GetIssueByIdAsync(long issueId);

        [Get("/api/internal/issues")]
        Task<List<InternalIssueResponse>> GetIssuesByProjectId([Query] long projectId);

        [Post("/api/internal/issues/startsprint")]
        Task<List<InternalIssueResponse>> StartSprint([Query] long projectId, [Body] IssueBatchRequest issuesIds);

        [Get("/api/internal/issues/batch")]
        Task<List<InternalIssueResponse>> GetIssuesByIds([Body] IssueBatchRequest request);
    }
}