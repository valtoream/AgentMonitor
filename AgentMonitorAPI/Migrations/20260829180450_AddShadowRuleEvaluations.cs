using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentMonitorAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddShadowRuleEvaluations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShadowRuleEvaluations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MonitoringRuleId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DeviceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    HealthCheckId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Metric = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Operator = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Threshold = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    RequiredConsecutiveChecks = table.Column<int>(type: "int", nullable: false),
                    MetricValue = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ConditionMet = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ConsecutiveCount = table.Column<int>(type: "int", nullable: false),
                    WouldTriggerIncident = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    EvaluatedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShadowRuleEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShadowRuleEvaluations_MonitoringRules_MonitoringRuleId",
                        column: x => x.MonitoringRuleId,
                        principalTable: "MonitoringRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ShadowRuleEvaluations_HealthCheckId",
                table: "ShadowRuleEvaluations",
                column: "HealthCheckId");

            migrationBuilder.CreateIndex(
                name: "IX_ShadowRuleEvaluations_MonitoringRuleId_DeviceId_EvaluatedAtU~",
                table: "ShadowRuleEvaluations",
                columns: new[] { "MonitoringRuleId", "DeviceId", "EvaluatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShadowRuleEvaluations");
        }
    }
}
