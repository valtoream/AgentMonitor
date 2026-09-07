using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Models
{
    public sealed class MonitoringRule
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public MonitoringMetric Metric { get; set; }

        public MonitoringOperator Operator { get; set; }

        public decimal Threshold { get; set; }

        public int ConsecutiveChecks { get; set; } = 1;

        public TicketSeverity Severity { get; set; }
            = TicketSeverity.High;

        public MonitoringRuleMode Mode { get; set; }
            = MonitoringRuleMode.Draft;

        public DateTime CreatedAtUtc { get; set; }
            = DateTime.UtcNow;

        public DateTime UpdatedAtUtc { get; set; }
            = DateTime.UtcNow;

        public ICollection<RuleSimulationRun> SimulationRuns { get; set; }
            = new List<RuleSimulationRun>();
    }
}