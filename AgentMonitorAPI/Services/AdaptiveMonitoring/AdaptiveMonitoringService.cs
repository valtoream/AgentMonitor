using AgentMonitor.Shared.Enums;
using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Services.AdaptiveMonitoring
{
    public sealed class AdaptiveMonitoringService
        : IAdaptiveMonitoringService
    {
        private const int ApproachingIntervalSeconds = 5;
        private const int NearThresholdIntervalSeconds = 3;
        private const int TriggeredIntervalSeconds = 2;

        private const decimal ApproachingDistanceRatio = 0.25m;
        private const decimal NearThresholdDistanceRatio = 0.10m;

        private readonly AppDbContext _dbContext;

        public AdaptiveMonitoringService(
            AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<AdaptiveMonitoringDecision> EvaluateAsync(
            HealthCheck healthCheck,
            CancellationToken cancellationToken = default)
        {
            List<MonitoringRule> activeRules =
                await _dbContext.MonitoringRules
                    .AsNoTracking()
                    .Where(
                        rule =>
                            rule.Mode ==
                            MonitoringRuleMode.Active)
                    .ToListAsync(
                        cancellationToken);

            if (activeRules.Count == 0)
            {
                return new AdaptiveMonitoringDecision(
                    MonitoringLevel.Normal,
                    0);
            }

            MonitoringLevel highestLevel =
                MonitoringLevel.Normal;

            foreach (MonitoringRule rule in activeRules)
            {
                decimal? metricValue =
                    GetMetricValue(
                        healthCheck,
                        rule.Metric);

                if (!metricValue.HasValue)
                {
                    continue;
                }

                MonitoringLevel ruleLevel =
                    DetermineLevel(
                        metricValue.Value,
                        rule.Operator,
                        rule.Threshold);

                if (ruleLevel > highestLevel)
                {
                    highestLevel =
                        ruleLevel;
                }

                if (highestLevel ==
                    MonitoringLevel.Triggered)
                {
                    break;
                }
            }

            int recommendedIntervalSeconds =
                highestLevel switch
                {
                    MonitoringLevel.Triggered =>
                        TriggeredIntervalSeconds,

                    MonitoringLevel.NearThreshold =>
                        NearThresholdIntervalSeconds,

                    MonitoringLevel.Approaching =>
                        ApproachingIntervalSeconds,

                    _ => 0
                };

            return new AdaptiveMonitoringDecision(
                highestLevel,
                recommendedIntervalSeconds);
        }

        private static decimal? GetMetricValue(
            HealthCheck healthCheck,
            MonitoringMetric metric)
        {
            switch (metric)
            {
                case MonitoringMetric.DiskUsagePercent:
                    return healthCheck.DiskUsagePercent;

                case MonitoringMetric.MemoryUsagePercent:
                    {
                        if (healthCheck.TotalMemoryBytes <= 0)
                        {
                            return null;
                        }

                        long usedMemoryBytes =
                            healthCheck.TotalMemoryBytes -
                            healthCheck.AvailableMemoryBytes;

                        decimal memoryUsagePercent =
                            (decimal)usedMemoryBytes /
                            healthCheck.TotalMemoryBytes *
                            100m;

                        return Math.Round(
                            memoryUsagePercent,
                            2);
                    }

                case MonitoringMetric.PendingUpdatesCount:
                    return healthCheck.PendingUpdatesCount;

                default:
                    return null;
            }
        }

        private static MonitoringLevel DetermineLevel(
            decimal value,
            MonitoringOperator monitoringOperator,
            decimal threshold)
        {
            if (IsTriggered(
                    value,
                    monitoringOperator,
                    threshold))
            {
                return MonitoringLevel.Triggered;
            }

            decimal denominator =
                Math.Max(
                    Math.Abs(threshold),
                    1m);

            decimal distanceRatio =
                Math.Abs(
                    value - threshold) /
                denominator;

            if (distanceRatio <=
                NearThresholdDistanceRatio)
            {
                return MonitoringLevel.NearThreshold;
            }

            if (distanceRatio <=
                ApproachingDistanceRatio)
            {
                return MonitoringLevel.Approaching;
            }

            return MonitoringLevel.Normal;
        }

        private static bool IsTriggered(
            decimal value,
            MonitoringOperator monitoringOperator,
            decimal threshold)
        {
            return monitoringOperator switch
            {
                MonitoringOperator.GreaterThan =>
                    value > threshold,

                MonitoringOperator.GreaterThanOrEqual =>
                    value >= threshold,

                MonitoringOperator.LessThan =>
                    value < threshold,

                MonitoringOperator.LessThanOrEqual =>
                    value <= threshold,

                MonitoringOperator.Equal =>
                    value == threshold,

                _ => false
            };
        }
    }
}