namespace AgentMonitor.Shared.DTOs.Tickets
{
    public sealed class TicketSummaryResponse
    {
        public Guid Id { get; set; }

        public Guid DeviceId { get; set; }

        public string DeviceHostname { get; set; } = string.Empty;

        public string RuleCode { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Severity { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; }

        public DateTime LastDetectedAtUtc { get; set; }

        public DateTime? ResolvedAtUtc { get; set; }

        public int DetectionCount { get; set; }
    }
}