using Backend.Sprints.Api.Data;
using Backend.Sprints.Api.Data.Repositories;
using Backend.Sprints.Api.Services;
using Microsoft.EntityFrameworkCore;
using Steeltoe.Discovery.Eureka;
using Backend.Sprints.Api.Clients; 
using Backend.Sprints.Api.Configuration; 
using Backend.Sprints.Api.Handlers;
using Refit;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using Backend.Sprints.Api.Cache;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());

        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;

        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sprints API",
        Version = "v1.0",
        Description = "API для спринтов проектов"
    });

    options.AddSecurityDefinition("bearerAuth", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Введите JWT токен:",
        In = ParameterLocation.Header
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "bearerAuth"
                }
            },
            new string[] {}
        }
    });

    var swaggerSettings = builder.Configuration.GetSection("Swagger");
    var servers = swaggerSettings.GetSection("Servers").Get<List<OpenApiServer>>();
    foreach (var server in servers)
    {
        options.AddServer(server);
    }
});

var redisHost = builder.Configuration["REDIS_HOST"] ?? "localhost";
var redisPort = builder.Configuration["REDIS_PORT"] ?? "6379";

builder.Services.AddHostedService<SprintExpirationService>();

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect($"{redisHost}:{redisPort}"));

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddSingleton<PermissionCacheReader>();
builder.Services.AddSingleton<AuthService>();

builder.Services.AddScoped<SprintRepository>();
builder.Services.AddScoped<SprintIssueRepository>();

builder.Services.AddScoped<ISprintService, SprintService>();
builder.Services.AddScoped<ISprintIssueService, SprintIssueService>();

builder.Services.AddHealthChecks();
builder.Services.AddEurekaDiscoveryClient();

builder.Services.Configure<ServiceAuthSettings>(builder.Configuration.GetSection(ServiceAuthSettings.SectionName));

builder.Services.AddTransient<InternalAuthHandler>();

var settings = new RefitSettings
{
    ContentSerializer = new SystemTextJsonContentSerializer(new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    })
};

builder.Services.AddRefitClient<IIssueClient>()
    .ConfigureHttpClient(client =>
    {
        client.BaseAddress = new Uri("http://issue-service:8083");
    })
    .AddHttpMessageHandler<InternalAuthHandler>();

builder.Services.AddRefitClient<IProjectClient>()
    .ConfigureHttpClient(client =>
    {
        client.BaseAddress = new Uri("http://board-service:8082");
    })
    .AddHttpMessageHandler<InternalAuthHandler>();

builder.Services.AddDbContext<SprintsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
        npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "sprints_service_schema")));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<SprintsDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        await dbContext.Database.MigrateAsync();
        logger.LogInformation("Миграции успешно применены");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Ошибка при применении миграций");
        throw;
    }
}

app.UseRouting();

app.MapSwagger("/v3/api-docs/{documentName}").AllowAnonymous();
app.MapHealthChecks("/healthz").AllowAnonymous();

app.UseGatewayAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/v3/api-docs/v1", "Sprints API v1");
    options.RoutePrefix = "swagger";
    options.DocumentTitle = "Sprints API";
});

app.MapControllers();

app.Run();