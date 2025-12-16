using Refit;
using Backend.Shared.DTOs;
using Backend.Dashboard.Api.Cache;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Dashboard.Api.Clients
{
    public interface IProjectClient
    {
        [Get("/api/internal/projects/{id}")]
        Task<ProjectDto> GetProjectById(long id);

        [Get("/api/internal/permissions")]
        Task<UserPermissionsResponse> GetUserPermissions([FromQuery] long projectId, [FromQuery] long userId);
    }
}