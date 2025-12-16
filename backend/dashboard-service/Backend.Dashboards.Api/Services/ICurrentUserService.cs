namespace Backend.Dashboard.Api.Services
{
    public interface ICurrentUserService
    {
        long UserId { get; }
        string? Email { get; }
        string? Role { get; }
        bool IsAuthenticated { get; }
        bool IsSystemRequest { get; }
    }
}
