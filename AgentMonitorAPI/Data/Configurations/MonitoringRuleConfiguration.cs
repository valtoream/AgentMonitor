using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public sealed class MonitoringRuleConfiguration
        : IEntityTypeConfiguration<MonitoringRule>
    {
        public void Configure(
            EntityTypeBuilder<MonitoringRule> builder)
        {
            builder.ToTable("MonitoringRules");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(x => x.Description)
                .HasMaxLength(1000);

            builder.Property(x => x.Metric)
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Operator)
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Mode)
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.Severity)
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.Threshold)
                .HasPrecision(10, 2)
                .IsRequired();

            builder.Property(x => x.ConsecutiveChecks)
                .IsRequired();

            builder.Property(x => x.CreatedAtUtc)
                .IsRequired();

            builder.Property(x => x.UpdatedAtUtc)
                .IsRequired();

            builder.HasIndex(x => x.Metric);

            builder.HasIndex(x => x.Mode);
        }
    }
}