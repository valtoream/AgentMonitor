using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.DTOs.MonitoringRules
{
    public sealed class MonitoringRuleResponse
    {
        public Guid Id { get; init; }

        public string Name { get; init; }
            = string.Empty;

        public string? Description { get; init; }

        public MonitoringMetric Metric { get; init; }

        public MonitoringOperator Operator { get; init; }

        public decimal Threshold { get; init; }

        public int ConsecutiveChecks { get; init; }

        public TicketSeverity Severity { get; init; }

        public MonitoringRuleMode Mode { get; init; }

        public DateTime CreatedAtUtc { get; init; }

        public DateTime UpdatedAtUtc { get; init; }
    }
}