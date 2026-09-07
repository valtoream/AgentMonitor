using AgentMonitorAPI.Data;
using AgentMonitorAPI.DTOs.RuleSimulation;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Services.RuleSimulation
{
    public sealed class RuleSimulationService
        : IRuleSimulationService
    {
        private const int DefaultStabilityChecks = 3;

        private const int MinimumTriggerRunsForNoiseEvaluation = 5;

        private readonly AppDbContext _dbContext;

        public RuleSimulationService(
            AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<RuleSimulationResponse> SimulateAsync(
            SimulateRuleRequest request,
            CancellationToken cancellationToken = default)
        {
            if (request.ConsecutiveChecks < 1)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(request.ConsecutiveChecks));
            }

            if (request.FromUtc.HasValue &&
                request.ToUtc.HasValue &&
                request.FromUtc.Value > request.ToUtc.Value)
            {
                throw new ArgumentException(
                    "FromUtc cannot be later than ToUtc.");
            }

            // =====================================================
            // Ако симулацията е вързана към съществуващо правило,
            // първо проверяваме дали правилото съществува.
            // =====================================================

            MonitoringRule? monitoringRule = null;

            if (request.MonitoringRuleId.HasValue)
            {
                monitoringRule =
                    await _dbContext.MonitoringRules
                        .AsNoTracking()
                        .SingleOrDefaultAsync(
                            x =>
                                x.Id ==
                                request.MonitoringRuleId.Value,
                            cancellationToken);

                if (monitoringRule is null)
                {
                    throw new InvalidOperationException(
                        "The monitoring rule could not be found.");
                }
            }

            // =====================================================
            // Historical HealthChecks query
            // =====================================================

            IQueryable<HealthCheck> query =
                _dbContext.HealthChecks
                    .AsNoTracking();

            if (request.DeviceId.HasValue)
            {
                query = query.Where(
                    x =>
                        x.DeviceId ==
                        request.DeviceId.Value);
            }

            if (request.FromUtc.HasValue)
            {
                query = query.Where(
                    x =>
                        x.CollectedAtUtc >=
                        request.FromUtc.Value);
            }

            if (request.ToUtc.HasValue)
            {
                query = query.Where(
                    x =>
                        x.CollectedAtUtc <=
                        request.ToUtc.Value);
            }

            List<HealthCheck> healthChecks =
                await query
                    .OrderBy(x => x.DeviceId)
                    .ThenBy(x => x.CollectedAtUtc)
                    .ToListAsync(cancellationToken);

            // =====================================================
            // Metric values for automatic threshold recommendation
            // =====================================================

            List<decimal> metricValues =
                healthChecks
                    .Select(
                        x => GetMetricValue(
                            x,
                            request.Metric))
                    .Where(x => x.HasValue)
                    .Select(x => x!.Value)
                    .OrderBy(x => x)
                    .ToList();

            // =====================================================
            // Per-device analysis
            // =====================================================

            List<RuleSimulationDeviceResult> deviceResults =
                new();

            foreach (
                IGrouping<Guid, HealthCheck> deviceGroup
                in healthChecks.GroupBy(x => x.DeviceId))
            {
                RuleSimulationDeviceResult result =
                    AnalyzeDevice(
                        deviceGroup.Key,
                        deviceGroup,
                        request);

                deviceResults.Add(result);
            }

            // =====================================================
            // Aggregated simulation statistics
            // =====================================================

            int analyzedHealthChecks =
                deviceResults.Sum(
                    x => x.AnalyzedHealthChecks);

            int skippedHealthChecks =
                deviceResults.Sum(
                    x => x.SkippedHealthChecks);

            int triggeredHealthChecks =
                deviceResults.Sum(
                    x => x.TriggeredHealthChecks);

            int triggerRuns =
                deviceResults.Sum(
                    x => x.TriggerRuns);

            int potentialIncidents =
                deviceResults.Sum(
                    x => x.PotentialIncidents);

            int transientIncidents =
                deviceResults.Sum(
                    x => x.TransientIncidents);

            decimal triggerRatePercent =
                analyzedHealthChecks == 0
                    ? 0
                    : Math.Round(
                        triggeredHealthChecks * 100m /
                        analyzedHealthChecks,
                        2);

            decimal transientRatePercent =
                triggerRuns == 0
                    ? 0
                    : Math.Round(
                        transientIncidents * 100m /
                        triggerRuns,
                        2);

            int affectedDevices =
                deviceResults.Count(
                    x => x.PotentialIncidents > 0);

            // =====================================================
            // Recommendation engine
            // =====================================================

            decimal? recommendedThreshold =
                CalculateRecommendedThreshold(
                    metricValues,
                    request.Metric,
                    request.Operator,
                    request.Threshold);

            int recommendedConsecutiveChecks =
                CalculateRecommendedConsecutiveChecks(
                    request.ConsecutiveChecks,
                    triggerRatePercent,
                    transientRatePercent,
                    triggerRuns);

            string noiseLevel =
                CalculateNoiseLevel(
                    triggerRatePercent,
                    transientRatePercent,
                    triggerRuns);

            string ruleQuality =
                CalculateRuleQuality(
                    analyzedHealthChecks,
                    triggerRatePercent,
                    transientRatePercent,
                    triggerRuns);

            string evaluationConfidence =
                CalculateEvaluationConfidence(
                    analyzedHealthChecks,
                    triggerRuns);

            string recommendationMessage =
                BuildRecommendationMessage(
                    ruleQuality,
                    noiseLevel,
                    evaluationConfidence,
                    request.Metric,
                    request.Threshold,
                    recommendedThreshold,
                    request.ConsecutiveChecks,
                    recommendedConsecutiveChecks);

            // =====================================================
            // Response
            // =====================================================

            var response =
                new RuleSimulationResponse
                {
                    Metric =
                        request.Metric,

                    Operator =
                        request.Operator,

                    Threshold =
                        request.Threshold,

                    ConsecutiveChecks =
                        request.ConsecutiveChecks,

                    AnalyzedHealthChecks =
                        analyzedHealthChecks,

                    SkippedHealthChecks =
                        skippedHealthChecks,

                    TriggeredHealthChecks =
                        triggeredHealthChecks,

                    TriggerRatePercent =
                        triggerRatePercent,

                    TriggerRuns =
                        triggerRuns,

                    PotentialIncidents =
                        potentialIncidents,

                    TransientIncidents =
                        transientIncidents,

                    TransientRatePercent =
                        transientRatePercent,

                    AffectedDevices =
                        affectedDevices,

                    RecommendedThreshold =
                        recommendedThreshold,

                    RecommendedConsecutiveChecks =
                        recommendedConsecutiveChecks,

                    RuleQuality =
                        ruleQuality,

                    NoiseLevel =
                        noiseLevel,

                    EvaluationConfidence =
                        evaluationConfidence,

                    RecommendationMessage =
                        recommendationMessage,

                    DeviceResults =
                        deviceResults
                };

            // =====================================================
            // Simulation History
            //
            // Preview simulation:
            // MonitoringRuleId == null
            // -> не записваме history.
            //
            // Existing rule simulation:
            // MonitoringRuleId != null
            // -> записваме RuleSimulationRun.
            // =====================================================

            if (monitoringRule is not null)
            {
                DateTime nowUtc =
                    DateTime.UtcNow;

                DateTime fromUtc =
                    request.FromUtc
                    ?? GetSimulationFromUtc(
                        healthChecks,
                        nowUtc);

                DateTime toUtc =
                    request.ToUtc
                    ?? GetSimulationToUtc(
                        healthChecks,
                        nowUtc);

                var simulationRun =
                    new RuleSimulationRun
                    {
                        Id =
                            Guid.NewGuid(),

                        MonitoringRuleId =
                            monitoringRule.Id,

                        FromUtc =
                            fromUtc,

                        ToUtc =
                            toUtc,

                        Threshold =
                            request.Threshold,

                        ConsecutiveChecks =
                            request.ConsecutiveChecks,

                        HealthChecksAnalyzed =
                            analyzedHealthChecks,

                        TriggeredChecks =
                            triggeredHealthChecks,

                        TriggerRatePercent =
                            triggerRatePercent,

                        TriggerRuns =
                            triggerRuns,

                        AffectedDevices =
                            affectedDevices,

                        EstimatedIncidents =
                            potentialIncidents,

                        TransientIncidents =
                            transientIncidents,

                        TransientRatePercent =
                            transientRatePercent,

                        RuleQuality =
                            ruleQuality,

                        NoiseLevel =
                            noiseLevel,

                        EvaluationConfidence =
                            evaluationConfidence,

                        RecommendedThreshold =
                            recommendedThreshold,

                        RecommendedConsecutiveChecks =
                            recommendedConsecutiveChecks,

                        CreatedAtUtc =
                            nowUtc
                    };

                _dbContext.RuleSimulationRuns.Add(
                    simulationRun);

                await _dbContext.SaveChangesAsync(
                    cancellationToken);
            }

            return response;
        }

        private static DateTime GetSimulationFromUtc(
            IReadOnlyList<HealthCheck> healthChecks,
            DateTime fallbackUtc)
        {
            if (healthChecks.Count == 0)
            {
                return fallbackUtc;
            }

            return healthChecks.Min(
                x => x.CollectedAtUtc);
        }

        private static DateTime GetSimulationToUtc(
            IReadOnlyList<HealthCheck> healthChecks,
            DateTime fallbackUtc)
        {
            if (healthChecks.Count == 0)
            {
                return fallbackUtc;
            }

            return healthChecks.Max(
                x => x.CollectedAtUtc);
        }

        private static RuleSimulationDeviceResult AnalyzeDevice(
            Guid deviceId,
            IEnumerable<HealthCheck> healthChecks,
            SimulateRuleRequest request)
        {
            int analyzed = 0;
            int skipped = 0;
            int triggered = 0;

            int triggerRuns = 0;
            int potentialIncidents = 0;
            int transientIncidents = 0;

            int currentRunLength = 0;

            int stabilityChecks =
                Math.Max(
                    request.ConsecutiveChecks,
                    DefaultStabilityChecks);

            void FinishCurrentRun()
            {
                if (currentRunLength == 0)
                {
                    return;
                }

                triggerRuns++;

                if (currentRunLength >=
                    request.ConsecutiveChecks)
                {
                    potentialIncidents++;
                }

                if (currentRunLength <
                    stabilityChecks)
                {
                    transientIncidents++;
                }

                currentRunLength = 0;
            }

            foreach (
                HealthCheck healthCheck
                in healthChecks)
            {
                decimal? metricValue =
                    GetMetricValue(
                        healthCheck,
                        request.Metric);

                if (!metricValue.HasValue)
                {
                    skipped++;

                    FinishCurrentRun();

                    continue;
                }

                analyzed++;

                bool isTriggered =
                    Compare(
                        metricValue.Value,
                        request.Operator,
                        request.Threshold);

                if (isTriggered)
                {
                    triggered++;
                    currentRunLength++;
                }
                else
                {
                    FinishCurrentRun();
                }
            }

            FinishCurrentRun();

            return new RuleSimulationDeviceResult
            {
                DeviceId =
                    deviceId,

                AnalyzedHealthChecks =
                    analyzed,

                SkippedHealthChecks =
                    skipped,

                TriggeredHealthChecks =
                    triggered,

                TriggerRuns =
                    triggerRuns,

                PotentialIncidents =
                    potentialIncidents,

                TransientIncidents =
                    transientIncidents
            };
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

            decimal usagePercent =
                usedMemoryBytes * 100m /
                healthCheck.TotalMemoryBytes;

            return Math.Round(
                usagePercent,
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
                        "Unsupported comparison operator.")
            };
        }

        private static decimal?
            CalculateRecommendedThreshold(
                IReadOnlyList<decimal> sortedValues,
                MonitoringMetric metric,
                MonitoringOperator comparisonOperator,
                decimal currentThreshold)
        {
            if (sortedValues.Count == 0)
            {
                return null;
            }

            decimal recommendation =
                comparisonOperator switch
                {
                    MonitoringOperator.GreaterThan =>
                        Percentile(
                            sortedValues,
                            0.95m),

                    MonitoringOperator.GreaterThanOrEqual =>
                        Percentile(
                            sortedValues,
                            0.95m),

                    MonitoringOperator.LessThan =>
                        Percentile(
                            sortedValues,
                            0.05m),

                    MonitoringOperator.LessThanOrEqual =>
                        Percentile(
                            sortedValues,
                            0.05m),

                    MonitoringOperator.Equal =>
                        currentThreshold,

                    _ =>
                        currentThreshold
                };

            if (metric ==
                MonitoringMetric.PendingUpdatesCount)
            {
                return Math.Round(
                    recommendation,
                    0,
                    MidpointRounding.AwayFromZero);
            }

            return Math.Round(
                recommendation,
                2);
        }

        private static int
            CalculateRecommendedConsecutiveChecks(
                int currentConsecutiveChecks,
                decimal triggerRatePercent,
                decimal transientRatePercent,
                int triggerRuns)
        {
            int current =
                Math.Max(
                    currentConsecutiveChecks,
                    1);

            if (triggerRatePercent >= 60m)
            {
                return Math.Max(
                    current,
                    3);
            }

            if (triggerRatePercent >= 30m)
            {
                return Math.Max(
                    current,
                    2);
            }

            if (triggerRuns >=
                MinimumTriggerRunsForNoiseEvaluation)
            {
                if (transientRatePercent >= 60m)
                {
                    return Math.Max(
                        current,
                        3);
                }

                if (transientRatePercent >= 30m)
                {
                    return Math.Max(
                        current,
                        2);
                }
            }

            return current;
        }

        private static string CalculateNoiseLevel(
            decimal triggerRatePercent,
            decimal transientRatePercent,
            int triggerRuns)
        {
            if (triggerRatePercent >= 60m)
            {
                return "High";
            }

            if (triggerRatePercent >= 30m)
            {
                return "Medium";
            }

            if (triggerRuns >=
                MinimumTriggerRunsForNoiseEvaluation)
            {
                if (transientRatePercent >= 60m)
                {
                    return "High";
                }

                if (transientRatePercent >= 30m)
                {
                    return "Medium";
                }
            }

            return "Low";
        }

        private static string CalculateRuleQuality(
            int analyzedHealthChecks,
            decimal triggerRatePercent,
            decimal transientRatePercent,
            int triggerRuns)
        {
            if (analyzedHealthChecks == 0)
            {
                return "InsufficientData";
            }

            if (triggerRatePercent >= 50m)
            {
                return "Poor";
            }

            if (triggerRatePercent >= 25m)
            {
                return "NeedsAdjustment";
            }

            if (triggerRuns >=
                MinimumTriggerRunsForNoiseEvaluation)
            {
                if (transientRatePercent >= 60m)
                {
                    return "Poor";
                }

                if (transientRatePercent >= 30m)
                {
                    return "NeedsAdjustment";
                }
            }

            return "Good";
        }

        private static string
            CalculateEvaluationConfidence(
                int analyzedHealthChecks,
                int triggerRuns)
        {
            if (analyzedHealthChecks < 50)
            {
                return "Low";
            }

            if (triggerRuns < 3)
            {
                return "Low";
            }

            if (triggerRuns < 10)
            {
                return "Medium";
            }

            return "High";
        }

        private static string BuildRecommendationMessage(
            string ruleQuality,
            string noiseLevel,
            string evaluationConfidence,
            MonitoringMetric metric,
            decimal currentThreshold,
            decimal? recommendedThreshold,
            int currentConsecutiveChecks,
            int recommendedConsecutiveChecks)
        {
            if (ruleQuality == "InsufficientData")
            {
                return
                    "There is not enough historical data " +
                    "to evaluate this monitoring rule.";
            }

            string confidenceText =
                $"Evaluation confidence: " +
                $"{evaluationConfidence}.";

            if (ruleQuality == "Good")
            {
                return
                    "The rule performs well on the " +
                    "available historical data. " +
                    $"Noise level: {noiseLevel}. " +
                    confidenceText;
            }

            string thresholdText =
                recommendedThreshold.HasValue
                    ? $"Recommended threshold for {metric}: " +
                      $"{recommendedThreshold.Value:F2}."
                    : "No threshold recommendation is available.";

            string consecutiveText =
                recommendedConsecutiveChecks !=
                currentConsecutiveChecks
                    ? $" Recommended consecutive checks: " +
                      $"{recommendedConsecutiveChecks}."
                    : $" Current consecutive checks " +
                      $"({currentConsecutiveChecks}) can be kept.";

            return
                $"Rule quality: {ruleQuality}. " +
                $"Noise level: {noiseLevel}. " +
                confidenceText + " " +
                $"Current threshold: {currentThreshold:F2}. " +
                thresholdText +
                consecutiveText;
        }

        private static decimal Percentile(
            IReadOnlyList<decimal> sortedValues,
            decimal percentile)
        {
            if (sortedValues.Count == 0)
            {
                throw new ArgumentException(
                    "The values collection cannot be empty.");
            }

            if (percentile < 0m ||
                percentile > 1m)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(percentile));
            }

            if (sortedValues.Count == 1)
            {
                return sortedValues[0];
            }

            decimal index =
                percentile *
                (sortedValues.Count - 1);

            int lowerIndex =
                (int)Math.Floor(index);

            int upperIndex =
                (int)Math.Ceiling(index);

            if (lowerIndex == upperIndex)
            {
                return sortedValues[
                    lowerIndex];
            }

            decimal fraction =
                index - lowerIndex;

            decimal lowerValue =
                sortedValues[lowerIndex];

            decimal upperValue =
                sortedValues[upperIndex];

            return lowerValue +
                   (upperValue - lowerValue) *
                   fraction;
        }
    }
}