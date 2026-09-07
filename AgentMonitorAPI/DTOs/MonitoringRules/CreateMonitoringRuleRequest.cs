using System.ComponentModel.DataAnnotations;
using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.DTOs.MonitoringRules
{
    public sealed class CreateMonitoringRuleRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public MonitoringMetric Metric { get; set; }

        public MonitoringOperator Operator { get; set; }

        public decimal Threshold { get; set; }

        [Range(1, 20)]
        public int ConsecutiveChecks { get; set; } = 1;

        public TicketSeverity Severity { get; set; }
            = TicketSeverity.High;
    }
}