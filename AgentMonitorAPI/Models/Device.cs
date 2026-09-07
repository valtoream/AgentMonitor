using System.ComponentModel.DataAnnotations;
using AgentMonitor.Shared.Enums;


namespace AgentMonitorAPI.Models
{
    public class Device
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(128)]
        public string DeviceIdentifier { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Hostname { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Manufacturer { get; set; }

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(200)]
        public string? OperatingSystem { get; set; }

        [MaxLength(100)]
        public string? OperatingSystemVersion { get; set; }

        [MaxLength(200)]
        public string? ProcessorName { get; set; }

        public long TotalMemoryBytes { get; set; }

        public int HealthScore { get; set; } = 100;

        public DeviceStatus Status { get; set; } = DeviceStatus.Unknown;

        public DateTime RegisteredAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime? LastSeenAtUtc { get; set; }

        public Agent? Agent { get; set; }

        public ICollection<HealthCheck> HealthChecks { get; set; }
            = new HashSet<HealthCheck>();

        public ICollection<Ticket> Tickets { get; set; }
            = new HashSet<Ticket>();
    }
}