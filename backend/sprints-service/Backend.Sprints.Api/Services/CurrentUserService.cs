using System.Security.Claims;

namespace Backend.Sprints.Api.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public CurrentUserService(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public long UserId => long.TryParse(_contextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : throw new UnauthorizedAccessException("UserId not found in headers");
        public string? Email => _contextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Email)?.Value;
        public string? Role => _contextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
        public bool IsAuthenticated => _contextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
        public bool IsSystemRequest => _contextAccessor.HttpContext?.User.FindFirst("AuthType")?.Value == "System";
    }
}
