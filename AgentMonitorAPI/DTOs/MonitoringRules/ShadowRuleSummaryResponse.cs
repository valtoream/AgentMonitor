namespace AgentMonitorAPI.DTOs.MonitoringRules
{
    public sealed class ShadowRuleSummaryResponse
    {
        public Guid MonitoringRuleId { get; init; }

        public string RuleName { get; init; } = string.Empty;

        public int Evaluations { get; init; }

        public int ConditionMetChecks { get; init; }

        public decimal ConditionRatePercent { get; init; }

        public int WouldTriggerIncidents { get; init; }

        public int AffectedDevices { get; init; }

        public DateTime? LastEvaluationAtUtc { get; init; }
    }
}