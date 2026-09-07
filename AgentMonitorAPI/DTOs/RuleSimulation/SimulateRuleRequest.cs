using System.ComponentModel.DataAnnotations;
using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.DTOs.RuleSimulation
{
    public sealed class SimulateRuleRequest
    {
        public Guid? MonitoringRuleId { get; set; }
        public Guid? DeviceId { get; set; }

        public MonitoringMetric Metric { get; set; }

        public MonitoringOperator Operator { get; set; }

        public decimal Threshold { get; set; }

        [Range(1, 20)]
        public int ConsecutiveChecks { get; set; } = 1;

        public DateTime? FromUtc { get; set; }

        public DateTime? ToUtc { get; set; }
    }
}