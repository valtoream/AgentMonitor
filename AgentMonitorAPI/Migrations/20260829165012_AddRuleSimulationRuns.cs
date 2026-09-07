using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentMonitorAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddRuleSimulationRuns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RuleSimulationRuns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MonitoringRuleId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FromUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ToUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    HealthChecksAnalyzed = table.Column<int>(type: "int", nullable: false),
                    TriggeredChecks = table.Column<int>(type: "int", nullable: false),
                    AffectedDevices = table.Column<int>(type: "int", nullable: false),
                    EstimatedIncidents = table.Column<int>(type: "int", nullable: false),
                    TransientIncidents = table.Column<int>(type: "int", nullable: false),
                    NoiseScorePercent = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    RecommendedThreshold = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    RecommendedConsecutiveChecks = table.Column<int>(type: "int", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RuleSimulationRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RuleSimulationRuns_MonitoringRules_MonitoringRuleId",
                        column: x => x.MonitoringRuleId,
                        principalTable: "MonitoringRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_RuleSimulationRuns_MonitoringRuleId",
                table: "RuleSimulationRuns",
                column: "MonitoringRuleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RuleSimulationRuns");
        }
    }
}
