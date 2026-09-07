using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentMonitorAPI.Migrations
{
    /// <inheritdoc />
    public partial class ExpandRuleSimulationHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NoiseScorePercent",
                table: "RuleSimulationRuns");

            migrationBuilder.AlterColumn<decimal>(
                name: "RecommendedThreshold",
                table: "RuleSimulationRuns",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ConsecutiveChecks",
                table: "RuleSimulationRuns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EvaluationConfidence",
                table: "RuleSimulationRuns",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "NoiseLevel",
                table: "RuleSimulationRuns",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RuleQuality",
                table: "RuleSimulationRuns",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "Threshold",
                table: "RuleSimulationRuns",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TransientRatePercent",
                table: "RuleSimulationRuns",
                type: "decimal(6,2)",
                precision: 6,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TriggerRatePercent",
                table: "RuleSimulationRuns",
                type: "decimal(6,2)",
                precision: 6,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "TriggerRuns",
                table: "RuleSimulationRuns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_RuleSimulationRuns_MonitoringRuleId_CreatedAtUtc",
                table: "RuleSimulationRuns",
                columns: new[] { "MonitoringRuleId", "CreatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RuleSimulationRuns_MonitoringRuleId_CreatedAtUtc",
                table: "RuleSimulationRuns");

            migrationBuilder.DropColumn(
                name: "ConsecutiveChecks",
                table: "RuleSimulationRuns");

            migrationBuilder.DropColumn(
                name: "EvaluationConfidence",
                table: "RuleSimulationRuns");

            migrationBuilder.DropColumn(
                name: "NoiseLevel",
                table: "RuleSimulationRuns");

            migrationBuilder.DropColumn(
                name: "RuleQuality",
                table: "RuleSimulationRuns");

            migrationBuilder.DropColumn(
                name: "Threshold",
                table: "RuleSimulationRuns");

            migrationBuilder.DropColumn(
                name: "TransientRatePercent",
                table: "RuleSimulationRuns");

            migrationBuilder.DropColumn(
                name: "TriggerRatePercent",
                table: "RuleSimulationRuns");

            migrationBuilder.DropColumn(
                name: "TriggerRuns",
                table: "RuleSimulationRuns");

            migrationBuilder.AlterColumn<decimal>(
                name: "RecommendedThreshold",
                table: "RuleSimulationRuns",
                type: "decimal(65,30)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldPrecision: 10,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "NoiseScorePercent",
                table: "RuleSimulationRuns",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
