using Refit;
using System.Threading.Tasks;
using Backend.Shared.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Sprints.Api.Clients
{
    public interface IProjectClient
    {
        [Get("/api/internal/projects/{projectId}")]
        Task<ProjectDto> GetProjectByIdAsync(long projectId);

        [Get("/api/internal/permissions")]
        Task<UserPermissionsResponse> GetUserPermissions([FromQuery] long projectId, [FromQuery] long userId);
    }
}