using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentMonitorAPI.Migrations
{
    /// <inheritdoc />
    public partial class ExtendTicketForRuleEngine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DetectionCount",
                table: "Tickets",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastDetectedAtUtc",
                table: "Tickets",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_LastDetectedAtUtc",
                table: "Tickets",
                column: "LastDetectedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_Status_Severity",
                table: "Tickets",
                columns: new[] { "Status", "Severity" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tickets_LastDetectedAtUtc",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_Status_Severity",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DetectionCount",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "LastDetectedAtUtc",
                table: "Tickets");
        }
    }
}
