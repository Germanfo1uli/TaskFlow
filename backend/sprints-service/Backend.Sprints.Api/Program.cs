using Backend.Sprints.Api.Data;
using Backend.Sprints.Api.Data.Repositories;
using Backend.Sprints.Api.Services;
using Microsoft.EntityFrameworkCore;
using Steeltoe.Discovery.Eureka;
using Backend.Sprints.Api.Clients; 
using Backend.Sprints.Api.Configuration; 
using Backend.Sprints.Api.Handlers;
using Refit;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<SprintRepository>();
builder.Services.AddScoped<SprintIssueRepository>();
builder.Services.AddScoped<ISprintService, SprintService>();
builder.Services.AddScoped<ISprintIssueService, SprintIssueService>();

builder.Services.AddHealthChecks();
builder.Services.AddEurekaDiscoveryClient();

builder.Services.Configure<ServiceAuthSettings>(builder.Configuration.GetSection(ServiceAuthSettings.SectionName));

builder.Services.AddTransient<InternalAuthHandler>();

builder.Services.AddRefitClient<IUserClient>()
    .ConfigureHttpClient(client =>
    {
        client.BaseAddress = new Uri("http://gateway-service");
    })
    .AddHttpMessageHandler<InternalAuthHandler>();

builder.Services.AddDbContext<SprintsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
        npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "sprints_service_schema")));

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapHealthChecks("/healthz");

app.UseGatewayAuthentication();

app.UseAuthorization();
app.MapControllers();

app.Run();