namespace AgentMonitorAPI.Models
{
    public sealed class RuleSimulationRun
    {
        public Guid Id { get; set; } =
            Guid.NewGuid();

        public Guid MonitoringRuleId { get; set; }

        public MonitoringRule MonitoringRule { get; set; } =
            null!;

        public DateTime FromUtc { get; set; }

        public DateTime ToUtc { get; set; }

        public decimal Threshold { get; set; }

        public int ConsecutiveChecks { get; set; }

        public int HealthChecksAnalyzed { get; set; }

        public int TriggeredChecks { get; set; }

        public decimal TriggerRatePercent { get; set; }

        public int TriggerRuns { get; set; }

        public int AffectedDevices { get; set; }

        public int EstimatedIncidents { get; set; }

        public int TransientIncidents { get; set; }

        public decimal TransientRatePercent { get; set; }

        public string RuleQuality { get; set; } =
            string.Empty;

        public string NoiseLevel { get; set; } =
            string.Empty;

        public string EvaluationConfidence { get; set; } =
            string.Empty;

        public decimal? RecommendedThreshold { get; set; }

        public int? RecommendedConsecutiveChecks { get; set; }

        public DateTime CreatedAtUtc { get; set; } =
            DateTime.UtcNow;
    }
}