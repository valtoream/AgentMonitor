using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgentMonitorAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveApiKeyPrefix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Agents_ApiKeyPrefix",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "ApiKeyPrefix",
                table: "Agents");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApiKeyPrefix",
                table: "Agents",
                type: "varchar(16)",
                maxLength: 16,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Agents_ApiKeyPrefix",
                table: "Agents",
                column: "ApiKeyPrefix");
        }
    }
}
