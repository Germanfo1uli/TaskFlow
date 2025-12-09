using System.Security.Claims;
using System.Text.Json;

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

        var gatewaySecretHeader = _configuration["ServiceAuth:GatewaySecretHeader"];
        var expectedSecret = _configuration["ServiceAuth:GatewaySecretValue"];
        var publicEndpoints = _configuration.GetSection("PublicEndpoints").Get<List<string>>() ?? new List<string>();

        if (IsPublicEndpoint(path, publicEndpoints))
        {
            _logger.LogDebug("Public endpoint accessed: {Path}", path);
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(gatewaySecretHeader, out var secretValue) || secretValue != expectedSecret)
        {
            _logger.LogWarning("UNAUTHORIZED: Invalid secret for {Method} {Path} from IP: {ClientIp}", method, path, clientIp);
            await SendUnauthorizedResponse(context, "Invalid gateway secret");
            return;
        }

        var claims = new List<Claim>();

        if (context.Request.Headers.TryGetValue("X-User-Id", out var userIdValue) && !string.IsNullOrEmpty(userIdValue))
        {
           
            var role = context.Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";
            var email = context.Request.Headers["X-User-Email"].FirstOrDefault() ?? "";

            claims.Add(new Claim(ClaimTypes.NameIdentifier, userIdValue));
            claims.Add(new Claim(ClaimTypes.Role, role));
            claims.Add(new Claim(ClaimTypes.Email, email));
            claims.Add(new Claim("AuthType", "User"));

            _logger.LogDebug("Authenticated USER: {UserId} ({Role}), path: {Path}", userIdValue, role, path);
        }
        else
        {
            var sourceService = context.Request.Headers["X-Source-Service"].FirstOrDefault() ?? "unknown-service";
            claims.Add(new Claim(ClaimTypes.Name, sourceService));
            claims.Add(new Claim(ClaimTypes.Role, "System")); 
            claims.Add(new Claim("AuthType", "System"));

            _logger.LogDebug("Authenticated SERVICE: {ServiceName}, path: {Path}", sourceService, path);
        }

        var identity = new ClaimsIdentity(claims, "GatewayAuth");
        var principal = new ClaimsPrincipal(identity);

        context.User = principal;

        await _next(context);
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