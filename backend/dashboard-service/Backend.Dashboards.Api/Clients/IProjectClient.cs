using Refit;
using Backend.Shared.DTOs;
using Backend.Dashboard.Api.Cache;

namespace Backend.Dashboard.Api.Clients
{
    public interface IProjectClient
    {
        [Get("/api/internal/projects/{id}")]
        Task<ProjectDto> GetProjectById(long id);

        [Get("/api/permissions/{userId}/{projectId}")]
        Task<UserPermissionsResponse> GetUserPermissions(long userId, long projectId);
    }
}