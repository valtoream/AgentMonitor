namespace AgentMonitorAPI.DTOs.MonitoringRules
{
    public sealed class RuleSimulationHistoryResponse
    {
        public Guid Id { get; init; }

        public Guid MonitoringRuleId { get; init; }

        public DateTime FromUtc { get; init; }

        public DateTime ToUtc { get; init; }

        public decimal Threshold { get; init; }

        public int ConsecutiveChecks { get; init; }

        public int HealthChecksAnalyzed { get; init; }

        public int TriggeredChecks { get; init; }

        public decimal TriggerRatePercent { get; init; }

        public int TriggerRuns { get; init; }

        public int AffectedDevices { get; init; }

        public int EstimatedIncidents { get; init; }

        public int TransientIncidents { get; init; }

        public decimal TransientRatePercent { get; init; }

        public string RuleQuality { get; init; } =
            string.Empty;

        public string NoiseLevel { get; init; } =
            string.Empty;

        public string EvaluationConfidence { get; init; } =
            string.Empty;

        public decimal? RecommendedThreshold { get; init; }

        public int? RecommendedConsecutiveChecks { get; init; }

        public DateTime CreatedAtUtc { get; init; }
    }
}