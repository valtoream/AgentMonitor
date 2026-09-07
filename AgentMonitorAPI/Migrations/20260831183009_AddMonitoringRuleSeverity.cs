using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentMonitorAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMonitoringRuleSeverity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Severity",
                table: "MonitoringRules",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "High")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Severity",
                table: "MonitoringRules");
        }
    }
}
