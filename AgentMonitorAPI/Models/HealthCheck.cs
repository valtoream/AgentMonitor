using AgentMonitor.Shared.Enums;

namespace AgentMonitorAPI.Models
{
    public class HealthCheck
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid DeviceId { get; set; }

        public DateTime CollectedAtUtc { get; set; }

        public DateTime ReceivedAtUtc { get; set; } = DateTime.UtcNow;

        public string? LoggedOnUser { get; set; }

        public long TotalMemoryBytes { get; set; }

        public long AvailableMemoryBytes { get; set; }

        public long SystemDriveTotalBytes { get; set; }

        public long SystemDriveFreeBytes { get; set; }

        public decimal DiskUsagePercent { get; set; }

        public bool? IsAntivirusInstalled { get; set; }

        public bool? IsAntivirusEnabled { get; set; }

        public bool? IsAntivirusUpToDate { get; set; }

        public int PendingUpdatesCount { get; set; }

        public DateTime? LastWindowsUpdateAtUtc { get; set; }

        public bool? IsWindowsActivated { get; set; }

        public int HealthScore { get; set; } = 100;

        public DeviceStatus Status { get; set; } = DeviceStatus.Unknown;

        public string? InstalledSoftwareJson { get; set; }

        public string? NetworkConfigurationJson { get; set; }

        public string? IssuesJson { get; set; }

        public Device Device { get; set; } = null!;

        public ICollection<Ticket> Tickets { get; set; }
            = new HashSet<Ticket>();
    }
}