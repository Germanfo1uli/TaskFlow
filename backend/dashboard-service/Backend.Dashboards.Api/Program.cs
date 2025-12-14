using Backend.Dashboard.Api.Clients;
using Backend.Dashboard.Api.Configuration;
using Backend.Dashboard.Api.Data;
using Backend.Dashboard.Api.Data.Repositories;
using Backend.Dashboard.Api.Handlers;
using Backend.Dashboard.Api.Services;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Refit;
using Steeltoe.Discovery.Eureka;
using Backend.Dashboard.Api.Messages;
using System.Text.Json;
using System.Text.Json.Serialization;

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
        client.BaseAddress = new Uri("http://board-service:8082");
    })
    .AddHttpMessageHandler<InternalAuthHandler>();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumers(typeof(ProjectCreatedConsumer).Assembly);

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitMqSettings = context.GetRequiredService<IConfiguration>().GetSection("RabbitMq");

        cfg.Host(rabbitMqSettings["Host"], "/", h =>
        {
            h.Username(rabbitMqSettings["Username"]);
            h.Password(rabbitMqSettings["Password"]);
        });

        cfg.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(2)));
        cfg.UseInMemoryOutbox();
        cfg.UseInstrumentation();

        

        cfg.ReceiveEndpoint("activity.all", e =>
        {
            e.ConfigureConsumeTopology = false;
            e.ClearSerialization();
            e.UseRawJsonSerializer(isDefault: true);

            e.Bind("activity.exchange", bind =>
            {
                bind.RoutingKey = "#";
                bind.ExchangeType = "topic";
            });

            e.ConfigureConsumers(context);
        });
    });
});

builder.Services.AddDbContext<DashboardDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
        npgsqlOptions => npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "dashboard_service_schema")));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DashboardDbContext>();
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