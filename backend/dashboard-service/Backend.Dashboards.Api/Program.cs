using Backend.Dashboard.Api.Clients;
using Backend.Dashboard.Api.Configuration;
using Backend.Dashboard.Api.Data;
using Backend.Dashboard.Api.Data.Repositories;
using Backend.Dashboard.Api.Handlers;
using Backend.Dashboard.Api.Services;
using Microsoft.EntityFrameworkCore;
using Refit;
using Steeltoe.Discovery.Eureka;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<DashboardSnapshotRepository>();
builder.Services.AddScoped<ActivityLogRepository>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();

builder.Services.AddHealthChecks();

builder.Services.AddEurekaDiscoveryClient();

builder.Services.Configure<ServiceAuthSettings>(builder.Configuration.GetSection(ServiceAuthSettings.SectionName));
builder.Services.AddTransient<InternalAuthHandler>();
builder.Services.AddRefitClient<IProjectClient>()
    .ConfigureHttpClient(client =>
    {
        client.BaseAddress = new Uri("http://localhost:8082");
    })
    .AddHttpMessageHandler<InternalAuthHandler>();

builder.Services.AddDbContext<DashboardDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
        npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "dashboard_service_schema")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapHealthChecks("/healthz");

app.UseAuthorization();
app.MapControllers();

app.Run();