using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

public class GatewayAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GatewayAuthenticationMiddleware> _logger;

    public GatewayAuthenticationMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<GatewayAuthenticationMiddleware> logger)
    {
        _next = next;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path;
        var method = context.Request.Method;
        var clientIp = context.Connection.RemoteIpAddress?.ToString();

        _logger.LogInformation("=== Gateway processing request: {Method} {Path} from {Ip}",
        context.Request.Method, path, clientIp);

        var gatewaySecretHeader = _configuration["ServiceAuth:GatewaySecretHeader"];
        var expectedSecret = _configuration["ServiceAuth:GatewaySecretValue"];
        var publicEndpoints = _configuration.GetSection("PublicEndpoints").Get<List<string>>() ?? new List<string>();


        if (IsPublicEndpoint(path, publicEndpoints))
        {
            _logger.LogDebug("Public endpoint accessed: {Path}", path);
            await _next(context);
            return;
        }

        if (context.Request.Headers.TryGetValue("X-User-Id", out var userIdValue) && !string.IsNullOrEmpty(userIdValue))
        {
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";
            var email = context.Request.Headers["X-User-Email"].FirstOrDefault() ?? "";

            _logger.LogInformation("User authenticated: ID={UserId}, Role={Role}, Email={Email}",
                userIdValue, role, email);

            // Создаем identity
            var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userIdValue),
            new(ClaimTypes.Role, role),
            new(ClaimTypes.Email, email),
            new("AuthType", "User")
        };

            var identity = new ClaimsIdentity(claims, "GatewayAuth");
            context.User = new ClaimsPrincipal(identity);
        }
        else
        {
            var sourceService = context.Request.Headers["X-Source-Service"].FirstOrDefault() ?? "unknown-service";
            _logger.LogInformation("Service-to-service request: {Service}", sourceService);

            var claims = new List<Claim>
        {
            new(ClaimTypes.Name, sourceService),
            new(ClaimTypes.Role, "System"),
            new("AuthType", "System")
        };

            var identity = new ClaimsIdentity(claims, "GatewayAuth");
            context.User = new ClaimsPrincipal(identity);
        }

        await _next(context);
        _logger.LogInformation("=== Gateway finished: Status {StatusCode}", context.Response.StatusCode);
    }

    private bool IsPublicEndpoint(PathString path, List<string> publicEndpoints)
    {
        foreach (var endpoint in publicEndpoints)
        {
            if (endpoint.EndsWith("/**"))
            {
                var prefix = endpoint.Replace("/**", "");
                if (path.StartsWithSegments(new PathString(prefix)))
                {
                    return true;
                }
            }
            else if (path.Equals(new PathString(endpoint), StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }
        return false;
    }

    private async Task SendUnauthorizedResponse(HttpContext context, string message)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";

        var response = new { timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), status = 401, error = message };
        var jsonResponse = JsonSerializer.Serialize(response);

        await context.Response.WriteAsync(jsonResponse);
    }
}

public static class GatewayAuthenticationMiddlewareExtensions
{
    public static IApplicationBuilder UseGatewayAuthentication(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GatewayAuthenticationMiddleware>();
    }
}