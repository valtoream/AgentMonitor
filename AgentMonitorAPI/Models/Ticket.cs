using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Models
{
    public sealed class Ticket
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid DeviceId { get; set; }

        public Guid? HealthCheckId { get; set; }

        public string RuleCode { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public TicketSeverity Severity { get; set; }
            = TicketSeverity.Medium;

        public TicketStatus Status { get; set; }
            = TicketStatus.Open;

        public DateTime CreatedAtUtc { get; set; }
            = DateTime.UtcNow;

        public DateTime LastDetectedAtUtc { get; set; }
            = DateTime.UtcNow;

        public DateTime? UpdatedAtUtc { get; set; }

        public DateTime? ResolvedAtUtc { get; set; }

        public int DetectionCount { get; set; } = 1;

        public Device Device { get; set; } = null!;

        public HealthCheck? HealthCheck { get; set; }
    }
}