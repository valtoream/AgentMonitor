using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public sealed class RuleSimulationRunConfiguration
        : IEntityTypeConfiguration<RuleSimulationRun>
    {
        public void Configure(
            EntityTypeBuilder<RuleSimulationRun> builder)
        {
            builder.ToTable("RuleSimulationRuns");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.FromUtc)
                .IsRequired();

            builder.Property(x => x.ToUtc)
                .IsRequired();

            builder.Property(x => x.Threshold)
                .HasPrecision(10, 2)
                .IsRequired();

            builder.Property(x => x.ConsecutiveChecks)
                .IsRequired();

            builder.Property(x => x.HealthChecksAnalyzed)
                .IsRequired();

            builder.Property(x => x.TriggeredChecks)
                .IsRequired();

            builder.Property(x => x.TriggerRatePercent)
                .HasPrecision(6, 2)
                .IsRequired();

            builder.Property(x => x.TriggerRuns)
                .IsRequired();

            builder.Property(x => x.AffectedDevices)
                .IsRequired();

            builder.Property(x => x.EstimatedIncidents)
                .IsRequired();

            builder.Property(x => x.TransientIncidents)
                .IsRequired();

            builder.Property(x => x.TransientRatePercent)
                .HasPrecision(6, 2)
                .IsRequired();

            builder.Property(x => x.RuleQuality)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.NoiseLevel)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.EvaluationConfidence)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.RecommendedThreshold)
                .HasPrecision(10, 2);

            builder.Property(x => x.RecommendedConsecutiveChecks);

            builder.Property(x => x.CreatedAtUtc)
                .IsRequired();

            builder.HasOne(x => x.MonitoringRule)
                .WithMany(x => x.SimulationRuns)
                .HasForeignKey(x => x.MonitoringRuleId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.MonitoringRuleId);

            builder.HasIndex(x => new
            {
                x.MonitoringRuleId,
                x.CreatedAtUtc
            });
        }
    }
}