using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Models
{
    public sealed class ShadowRuleEvaluation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid MonitoringRuleId { get; set; }

        public Guid DeviceId { get; set; }

        public Guid HealthCheckId { get; set; }

        // Snapshot на правилото в момента на evaluation
        public MonitoringMetric Metric { get; set; }

        public MonitoringOperator Operator { get; set; }

        public decimal Threshold { get; set; }

        public int RequiredConsecutiveChecks { get; set; }

        // Реално измерената стойност
        public decimal MetricValue { get; set; }

        // Дали текущият HealthCheck нарушава правилото
        public bool ConditionMet { get; set; }

        // Колко последователни HealthChecks нарушават правилото
        public int ConsecutiveCount { get; set; }

        // Ако правилото беше Active,
        // тук щеше да се създаде incident
        public bool WouldTriggerIncident { get; set; }

        public DateTime EvaluatedAtUtc { get; set; } =
            DateTime.UtcNow;

        public MonitoringRule MonitoringRule { get; set; } = null!;
    }
}