using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public class HealthCheckConfiguration
        : IEntityTypeConfiguration<HealthCheck>
    {
        public void Configure(EntityTypeBuilder<HealthCheck> builder)
        {
            builder.ToTable("HealthChecks");

            builder.HasKey(healthCheck => healthCheck.Id);

            builder.Property(healthCheck => healthCheck.LoggedOnUser)
                .HasMaxLength(255);

            builder.Property(healthCheck => healthCheck.DiskUsagePercent)
                .HasPrecision(5, 2);

            builder.Property(healthCheck => healthCheck.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(healthCheck => healthCheck.InstalledSoftwareJson)
                .HasColumnType("json");

            builder.Property(healthCheck => healthCheck.NetworkConfigurationJson)
                .HasColumnType("json");

            builder.Property(healthCheck => healthCheck.IssuesJson)
                .HasColumnType("json");

            builder.HasIndex(healthCheck => new
            {
                healthCheck.DeviceId,
                healthCheck.CollectedAtUtc
            });
        }
    }
}