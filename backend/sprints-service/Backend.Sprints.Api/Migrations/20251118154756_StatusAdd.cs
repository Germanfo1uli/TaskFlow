using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Sprints.Api.Migrations
{
    /// <inheritdoc />
    public partial class StatusAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "status",
                schema: "sprints_service_schema",
                table: "sprints",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Planned",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "planned");

            migrationBuilder.AddForeignKey(
                name: "FK_sprint_issues_sprints_sprint_id",
                schema: "sprints_service_schema",
                table: "sprint_issues",
                column: "sprint_id",
                principalSchema: "sprints_service_schema",
                principalTable: "sprints",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_sprint_issues_sprints_sprint_id",
                schema: "sprints_service_schema",
                table: "sprint_issues");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                schema: "sprints_service_schema",
                table: "sprints",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "planned",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "Planned");
        }
    }
}
