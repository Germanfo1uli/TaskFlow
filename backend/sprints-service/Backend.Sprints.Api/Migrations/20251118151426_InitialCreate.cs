using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Sprints.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "sprints_service_schema");

            migrationBuilder.CreateTable(
                name: "sprint_issues",
                schema: "sprints_service_schema",
                columns: table => new
                {
                    issue_id = table.Column<long>(type: "bigint", nullable: false),
                    sprint_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sprint_issues", x => new { x.issue_id, x.sprint_id });
                });

            migrationBuilder.CreateTable(
                name: "sprints",
                schema: "sprints_service_schema",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    project_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    goal = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "planned")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sprints", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sprint_issues_issue_id",
                schema: "sprints_service_schema",
                table: "sprint_issues",
                column: "issue_id");

            migrationBuilder.CreateIndex(
                name: "IX_sprint_issues_sprint_id",
                schema: "sprints_service_schema",
                table: "sprint_issues",
                column: "sprint_id");

            migrationBuilder.CreateIndex(
                name: "IX_sprints_end_date",
                schema: "sprints_service_schema",
                table: "sprints",
                column: "end_date");

            migrationBuilder.CreateIndex(
                name: "IX_sprints_project_id",
                schema: "sprints_service_schema",
                table: "sprints",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_sprints_start_date",
                schema: "sprints_service_schema",
                table: "sprints",
                column: "start_date");

            migrationBuilder.CreateIndex(
                name: "IX_sprints_status",
                schema: "sprints_service_schema",
                table: "sprints",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sprint_issues",
                schema: "sprints_service_schema");

            migrationBuilder.DropTable(
                name: "sprints",
                schema: "sprints_service_schema");
        }
    }
}
