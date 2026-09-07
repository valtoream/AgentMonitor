using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using AgentMonitorAPI.Services.Rules;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Services.ActiveRules
{
    public sealed class ActiveRuleService : IActiveRuleService
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<ActiveRuleService> _logger;

        public ActiveRuleService(
            AppDbContext dbContext,
            ILogger<ActiveRuleService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IReadOnlyList<RuleResult>> EvaluateAsync(
            HealthCheck healthCheck,
            CancellationToken cancellationToken = default)
        {
            List<MonitoringRule> activeRules =
                await _dbContext.MonitoringRules
                    .AsNoTracking()
                    .Where(rule =>
                        rule.Mode == MonitoringRuleMode.Active)
                    .ToListAsync(cancellationToken);

            if (activeRules.Count == 0)
            {
                return Array.Empty<RuleResult>();
            }

            List<RuleResult> results = new();

            foreach (MonitoringRule rule in activeRules)
            {
                decimal? currentMetricValue =
                    GetMetricValue(
                        healthCheck,
                        rule.Metric);

                if (!currentMetricValue.HasValue)
                {
                    continue;
                }

                bool currentConditionMet =
                    Compare(
                        currentMetricValue.Value,
                        rule.Operator,
                        rule.Threshold);

                if (!currentConditionMet)
                {
                    continue;
                }

                int requiredChecks =
                    Math.Max(
                        1,
                        rule.ConsecutiveChecks);

                bool consecutiveRequirementMet =
                    await HasRequiredConsecutiveChecksAsync(
                        rule,
                        healthCheck,
                        requiredChecks,
                        cancellationToken);

                if (!consecutiveRequirementMet)
                {
                    continue;
                }

                var result = new RuleResult
                {
                    IsTriggered = true,

                    RuleCode =
                        $"MONITORING_RULE_{rule.Id:N}",

                    Title =
                        rule.Name,

                    Description =
                        BuildDescription(
                            rule,
                            currentMetricValue.Value),

                    Severity =
                        rule.Severity,

                    ScorePenalty =
                        10
                };

                results.Add(result);

                _logger.LogInformation(
                    "Active monitoring rule {RuleId} ({RuleName}) " +
                    "triggered for device {DeviceId}.",
                    rule.Id,
                    rule.Name,
                    healthCheck.DeviceId);
            }

            return results;
        }

        private async Task<bool> HasRequiredConsecutiveChecksAsync(
            MonitoringRule rule,
            HealthCheck currentHealthCheck,
            int requiredChecks,
            CancellationToken cancellationToken)
        {
            if (requiredChecks <= 1)
            {
                return true;
            }

            int previousChecksNeeded =
                requiredChecks - 1;

            List<HealthCheck> previousHealthChecks =
                await _dbContext.HealthChecks
                    .AsNoTracking()
                    .Where(check =>
                        check.DeviceId ==
                            currentHealthCheck.DeviceId &&

                        check.ReceivedAtUtc >=
                            rule.UpdatedAtUtc &&

                        check.Id !=
                            currentHealthCheck.Id)
                    .OrderByDescending(
                        check => check.ReceivedAtUtc)
                    .Take(previousChecksNeeded)
                    .ToListAsync(cancellationToken);

            if (previousHealthChecks.Count <
                previousChecksNeeded)
            {
                return false;
            }

            foreach (HealthCheck previousHealthCheck
                     in previousHealthChecks)
            {
                decimal? previousMetricValue =
                    GetMetricValue(
                        previousHealthCheck,
                        rule.Metric);

                if (!previousMetricValue.HasValue)
                {
                    return false;
                }

                bool previousConditionMet =
                    Compare(
                        previousMetricValue.Value,
                        rule.Operator,
                        rule.Threshold);

                if (!previousConditionMet)
                {
                    return false;
                }
            }

            return true;
        }

        private static decimal? GetMetricValue(
            HealthCheck healthCheck,
            MonitoringMetric metric)
        {
            return metric switch
            {
                MonitoringMetric.DiskUsagePercent =>
                    healthCheck.DiskUsagePercent,

                MonitoringMetric.MemoryUsagePercent =>
                    CalculateMemoryUsagePercent(
                        healthCheck),

                MonitoringMetric.PendingUpdatesCount =>
                    healthCheck.PendingUpdatesCount,

                _ => null
            };
        }

        private static decimal? CalculateMemoryUsagePercent(
            HealthCheck healthCheck)
        {
            if (healthCheck.TotalMemoryBytes <= 0)
            {
                return null;
            }

            long usedMemoryBytes =
                healthCheck.TotalMemoryBytes -
                healthCheck.AvailableMemoryBytes;

            decimal percentage =
                usedMemoryBytes * 100m /
                healthCheck.TotalMemoryBytes;

            return Math.Clamp(
                percentage,
                0m,
                100m);
        }

        private static bool Compare(
            decimal actualValue,
            MonitoringOperator monitoringOperator,
            decimal threshold)
        {
            return monitoringOperator switch
            {
                MonitoringOperator.GreaterThan =>
                    actualValue > threshold,

                MonitoringOperator.GreaterThanOrEqual =>
                    actualValue >= threshold,

                MonitoringOperator.LessThan =>
                    actualValue < threshold,

                MonitoringOperator.LessThanOrEqual =>
                    actualValue <= threshold,

                MonitoringOperator.Equal =>
                    actualValue == threshold,

                _ => false
            };
        }

        private static string BuildDescription(
            MonitoringRule rule,
            decimal currentMetricValue)
        {
            string baseDescription =
                string.IsNullOrWhiteSpace(
                    rule.Description)
                    ? "Dynamic monitoring rule triggered."
                    : rule.Description;

            return
                $"{baseDescription} " +
                $"Metric: {rule.Metric}. " +
                $"Current value: {currentMetricValue:0.##}. " +
                $"Operator: {rule.Operator}. " +
                $"Threshold: {rule.Threshold:0.##}. " +
                $"Required consecutive checks: " +
                $"{rule.ConsecutiveChecks}.";
        }
    }
}