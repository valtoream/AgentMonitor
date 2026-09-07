namespace AgentMonitor.Shared.DTOs.Audit
{
    public sealed class AuditLogResponse
    {
        public Guid Id { get; set; }

        public Guid? UserId { get; set; }

        public string? Username { get; set; }

        public string Action { get; set; } = string.Empty;

        public string? EntityType { get; set; }

        public string? EntityId { get; set; }

        public string? Details { get; set; }

        public DateTime CreatedAtUtc { get; set; }
    }
}