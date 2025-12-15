using Refit;
using System.Threading.Tasks;
using Backend.Shared.DTOs;

namespace Backend.Sprints.Api.Clients
{
    public interface IInternalApiClient
    {
        [Get("/api/internal/projects/{projectId}")]
        Task<ApiResponse<ProjectDto>> GetProjectByIdAsync(long projectId);
        
        [Get("/api/internal/issues/{issueId}")]
        Task<ApiResponse<InternalIssueResponse>> GetIssueByIdAsync(long issueId);
    }
}