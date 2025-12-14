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
    // --- Consumers from project-service ---
    x.AddConsumer<ProjectCreatedConsumer>();
    x.AddConsumer<ProjectUpdatedConsumer>();
    x.AddConsumer<ProjectDeletedConsumer>();
    x.AddConsumer<ProjectMemberAddedConsumer>();
    x.AddConsumer<ProjectMemberRemovedConsumer>();

    // --- Consumers from issue-service ---
    x.AddConsumer<IssueCreatedConsumer>();
    x.AddConsumer<IssueDeletedConsumer>();
    x.AddConsumer<IssueUpdatedConsumer>();
    x.AddConsumer<IssueStatusChangedConsumer>();
    x.AddConsumer<IssueTypeChangedConsumer>();
    x.AddConsumer<IssuePriorityChangedConsumer>();
    x.AddConsumer<IssueAssigneeAddedConsumer>();
    x.AddConsumer<IssueAssigneeRemovedConsumer>();
    x.AddConsumer<IssueCommentCreatedConsumer>();
    x.AddConsumer<IssueCommentUpdatedConsumer>();
    x.AddConsumer<IssueCommentDeletedConsumer>();
    x.AddConsumer<AttachmentCreatedConsumer>();
    x.AddConsumer<AttachmentDeletedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitMqSettings = context.GetRequiredService<IConfiguration>().GetSection("RabbitMq");
        var host = rabbitMqSettings["Host"];
        var username = rabbitMqSettings["Username"];
        var password = rabbitMqSettings["Password"];

        cfg.Host(host, "/", h =>
        {
            h.Username(username);
            h.Password(password);
        });

        cfg.ReceiveEndpoint("dashboard.activity.queue", e =>
        {
            e.ConfigureConsumeTopology = false;

            e.Bind("activity.exchange", s =>
            {
                s.ExchangeType = "topic";
                s.RoutingKey = "#";
            });

            e.UseRawJsonSerializer(isDefault: true);

            // Project consumers
            e.ConfigureConsumer<ProjectCreatedConsumer>(context);
            e.ConfigureConsumer<ProjectUpdatedConsumer>(context);
            e.ConfigureConsumer<ProjectDeletedConsumer>(context);
            e.ConfigureConsumer<ProjectMemberAddedConsumer>(context);
            e.ConfigureConsumer<ProjectMemberRemovedConsumer>(context);

            // Issue consumers
            e.ConfigureConsumer<IssueCreatedConsumer>(context);
            e.ConfigureConsumer<IssueDeletedConsumer>(context);
            e.ConfigureConsumer<IssueUpdatedConsumer>(context);
            e.ConfigureConsumer<IssueStatusChangedConsumer>(context);
            e.ConfigureConsumer<IssueTypeChangedConsumer>(context);
            e.ConfigureConsumer<IssuePriorityChangedConsumer>(context);
            e.ConfigureConsumer<IssueAssigneeAddedConsumer>(context);
            e.ConfigureConsumer<IssueAssigneeRemovedConsumer>(context);
            e.ConfigureConsumer<IssueCommentCreatedConsumer>(context);
            e.ConfigureConsumer<IssueCommentUpdatedConsumer>(context);
            e.ConfigureConsumer<IssueCommentDeletedConsumer>(context);
            e.ConfigureConsumer<AttachmentCreatedConsumer>(context);
            e.ConfigureConsumer<AttachmentDeletedConsumer>(context);
        });
    });
});


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

app.UseGatewayAuthentication();

app.UseAuthorization();
app.MapControllers();

app.Run();