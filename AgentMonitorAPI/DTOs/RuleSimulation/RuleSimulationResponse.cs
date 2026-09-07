using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.DTOs.RuleSimulation
{
    public sealed class RuleSimulationResponse
    {
        public MonitoringMetric Metric { get; init; }

        public MonitoringOperator Operator { get; init; }

        public decimal Threshold { get; init; }

        public int ConsecutiveChecks { get; init; }

        public int AnalyzedHealthChecks { get; init; }

        public int SkippedHealthChecks { get; init; }

        public int TriggeredHealthChecks { get; init; }

        public decimal TriggerRatePercent { get; init; }

        public int TriggerRuns { get; init; }

        public int PotentialIncidents { get; init; }

        public int TransientIncidents { get; init; }

        public decimal TransientRatePercent { get; init; }

        public int AffectedDevices { get; init; }

        public decimal? RecommendedThreshold { get; init; }

        public int RecommendedConsecutiveChecks { get; init; }

        public string RuleQuality { get; init; } =
            string.Empty;

        public string NoiseLevel { get; init; } =
            string.Empty;

        public string EvaluationConfidence { get; init; } =
            string.Empty;

        public string RecommendationMessage { get; init; } =
            string.Empty;

        public IReadOnlyList<RuleSimulationDeviceResult>
            DeviceResults
        { get; init; }
                = Array.Empty<RuleSimulationDeviceResult>();
    }
}