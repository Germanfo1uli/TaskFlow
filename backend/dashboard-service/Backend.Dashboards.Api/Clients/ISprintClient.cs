using Refit;
using Backend.Shared.DTOs; 

namespace Backend.Dashboard.Api.Clients
{
    public interface IProjectClient
    {
        [Get("/api/internal/projects/{id}")]
        Task<ProjectDto> GetProjectById(long id);
    }
}