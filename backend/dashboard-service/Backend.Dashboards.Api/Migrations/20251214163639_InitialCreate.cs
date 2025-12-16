using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Dashboard.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dashboard_service_schema");

            migrationBuilder.CreateTable(
                name: "activity_logs",
                schema: "dashboard_service_schema",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    project_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    action_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_id = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activity_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "dashboard_snapshots",
                schema: "dashboard_service_schema",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    project_id = table.Column<long>(type: "bigint", nullable: false),
                    snapshot_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    metric_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    metric_value = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dashboard_snapshots", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_activity_logs_action_type",
                schema: "dashboard_service_schema",
                table: "activity_logs",
                column: "action_type");

            migrationBuilder.CreateIndex(
                name: "IX_activity_logs_created_at",
                schema: "dashboard_service_schema",
                table: "activity_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_activity_logs_entity_id",
                schema: "dashboard_service_schema",
                table: "activity_logs",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "IX_activity_logs_entity_type",
                schema: "dashboard_service_schema",
                table: "activity_logs",
                column: "entity_type");

            migrationBuilder.CreateIndex(
                name: "IX_activity_logs_project_id",
                schema: "dashboard_service_schema",
                table: "activity_logs",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_activity_logs_user_id",
                schema: "dashboard_service_schema",
                table: "activity_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_dashboard_snapshots_created_at",
                schema: "dashboard_service_schema",
                table: "dashboard_snapshots",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_dashboard_snapshots_metric_name",
                schema: "dashboard_service_schema",
                table: "dashboard_snapshots",
                column: "metric_name");

            migrationBuilder.CreateIndex(
                name: "IX_dashboard_snapshots_project_id",
                schema: "dashboard_service_schema",
                table: "dashboard_snapshots",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_dashboard_snapshots_snapshot_date",
                schema: "dashboard_service_schema",
                table: "dashboard_snapshots",
                column: "snapshot_date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "activity_logs",
                schema: "dashboard_service_schema");

            migrationBuilder.DropTable(
                name: "dashboard_snapshots",
                schema: "dashboard_service_schema");
        }
    }
}
