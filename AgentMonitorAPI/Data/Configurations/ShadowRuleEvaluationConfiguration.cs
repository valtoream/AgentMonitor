using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public sealed class ShadowRuleEvaluationConfiguration
        : IEntityTypeConfiguration<ShadowRuleEvaluation>
    {
        public void Configure(
            EntityTypeBuilder<ShadowRuleEvaluation> builder)
        {
            builder.ToTable("ShadowRuleEvaluations");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Metric)
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Operator)
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Threshold)
                .HasPrecision(10, 2);

            builder.Property(x => x.MetricValue)
                .HasPrecision(10, 2);

            builder.Property(x => x.RequiredConsecutiveChecks)
                .IsRequired();

            builder.Property(x => x.ConsecutiveCount)
                .IsRequired();

            builder.Property(x => x.EvaluatedAtUtc)
                .IsRequired();

            builder.HasIndex(x =>
                new
                {
                    x.MonitoringRuleId,
                    x.DeviceId,
                    x.EvaluatedAtUtc
                });

            builder.HasIndex(x => x.HealthCheckId);

            builder.HasOne(x => x.MonitoringRule)
                .WithMany()
                .HasForeignKey(x => x.MonitoringRuleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}