using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Services.ShadowRules
{
    public sealed class ShadowRuleService
        : IShadowRuleService
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<ShadowRuleService> _logger;

        public ShadowRuleService(
            AppDbContext dbContext,
            ILogger<ShadowRuleService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task EvaluateAsync(
            HealthCheck healthCheck,
            CancellationToken cancellationToken = default)
        {
            List<MonitoringRule> shadowRules =
                await _dbContext.MonitoringRules
                    .AsNoTracking()
                    .Where(x =>
                        x.Mode == MonitoringRuleMode.Shadow)
                    .ToListAsync(cancellationToken);

            if (shadowRules.Count == 0)
            {
                return;
            }

            foreach (MonitoringRule rule in shadowRules)
            {
                decimal? metricValue =
                    GetMetricValue(
                        healthCheck,
                        rule.Metric);

                if (!metricValue.HasValue)
                {
                    continue;
                }

                bool conditionMet =
                    Compare(
                        metricValue.Value,
                        rule.Operator,
                        rule.Threshold);

                int consecutiveCount = 0;

                if (conditionMet)
                {
                    /*
                     * Използваме само evaluations,
                     * направени след последната промяна
                     * на правилото.
                     *
                     * Ако threshold или mode бъдат
                     * променени, consecutive sequence
                     * започва отначало.
                     */
                    ShadowRuleEvaluation? previous =
                        await _dbContext.ShadowRuleEvaluations
                            .AsNoTracking()
                            .Where(x =>
                                x.MonitoringRuleId == rule.Id &&
                                x.DeviceId == healthCheck.DeviceId &&
                                x.EvaluatedAtUtc >=
                                    rule.UpdatedAtUtc)
                            .OrderByDescending(
                                x => x.EvaluatedAtUtc)
                            .FirstOrDefaultAsync(
                                cancellationToken);

                    if (previous is not null &&
                        previous.ConditionMet)
                    {
                        consecutiveCount =
                            previous.ConsecutiveCount + 1;
                    }
                    else
                    {
                        consecutiveCount = 1;
                    }
                }

                int requiredChecks =
                    Math.Max(
                        rule.ConsecutiveChecks,
                        1);

                /*
                 * Важно:
                 *
                 * Trigger се записва само веднъж —
                 * точно когато достигнем необходимия
                 * брой проверки.
                 *
                 * Ако condition остане true още 20
                 * проверки, няма да симулираме
                 * 20 отделни incidents.
                 */
                bool wouldTriggerIncident =
                    conditionMet &&
                    consecutiveCount == requiredChecks;

                var evaluation =
                    new ShadowRuleEvaluation
                    {
                        Id = Guid.NewGuid(),

                        MonitoringRuleId =
                            rule.Id,

                        DeviceId =
                            healthCheck.DeviceId,

                        HealthCheckId =
                            healthCheck.Id,

                        Metric =
                            rule.Metric,

                        Operator =
                            rule.Operator,

                        Threshold =
                            rule.Threshold,

                        RequiredConsecutiveChecks =
                            requiredChecks,

                        MetricValue =
                            metricValue.Value,

                        ConditionMet =
                            conditionMet,

                        ConsecutiveCount =
                            consecutiveCount,

                        WouldTriggerIncident =
                            wouldTriggerIncident,

                        EvaluatedAtUtc =
                            DateTime.UtcNow
                    };

                _dbContext.ShadowRuleEvaluations.Add(
                    evaluation);

                if (wouldTriggerIncident)
                {
                    _logger.LogInformation(
                        "Shadow rule {RuleId} would trigger " +
                        "an incident for device {DeviceId}. " +
                        "Metric {Metric} = {MetricValue}, " +
                        "threshold = {Threshold}.",
                        rule.Id,
                        healthCheck.DeviceId,
                        rule.Metric,
                        metricValue.Value,
                        rule.Threshold);
                }
            }

            /*
             * НАРОЧНО няма SaveChangesAsync тук.
             *
             * HealthCheckService продължава към
             * TicketService, който записва целия
             * HealthCheck pipeline наведнъж.
             */
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

                _ =>
                    throw new ArgumentOutOfRangeException(
                        nameof(metric),
                        metric,
                        "Unsupported monitoring metric.")
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

            usedMemoryBytes =
                Math.Clamp(
                    usedMemoryBytes,
                    0,
                    healthCheck.TotalMemoryBytes);

            decimal percentage =
                usedMemoryBytes * 100m /
                healthCheck.TotalMemoryBytes;

            return Math.Round(
                percentage,
                2);
        }

        private static bool Compare(
            decimal actualValue,
            MonitoringOperator comparisonOperator,
            decimal threshold)
        {
            return comparisonOperator switch
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

                _ =>
                    throw new ArgumentOutOfRangeException(
                        nameof(comparisonOperator),
                        comparisonOperator,
                        "Unsupported monitoring operator.")
            };
        }
    }
}