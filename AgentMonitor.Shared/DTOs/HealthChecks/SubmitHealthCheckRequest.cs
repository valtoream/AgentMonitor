using System.ComponentModel.DataAnnotations;

namespace AgentMonitor.Shared.DTOs.HealthChecks
{
    public class SubmitHealthCheckRequest
    {
        public DateTime CollectedAtUtc { get; set; }

        [StringLength(255)]
        public string? LoggedOnUser { get; set; }

        [Range(0, long.MaxValue)]
        public long TotalMemoryBytes { get; set; }

        [Range(0, long.MaxValue)]
        public long AvailableMemoryBytes { get; set; }

        [Range(0, long.MaxValue)]
        public long SystemDriveTotalBytes { get; set; }

        [Range(0, long.MaxValue)]
        public long SystemDriveFreeBytes { get; set; }

        [Range(0, 100)]
        public decimal DiskUsagePercent { get; set; }

        public bool? IsAntivirusInstalled { get; set; }

        public bool? IsAntivirusEnabled { get; set; }

        public bool? IsAntivirusUpToDate { get; set; }

        [Range(0, int.MaxValue)]
        public int PendingUpdatesCount { get; set; }

        public DateTime? LastWindowsUpdateAtUtc { get; set; }

        public bool? IsWindowsActivated { get; set; }

        public string? InstalledSoftwareJson { get; set; }

        public string? NetworkConfigurationJson { get; set; }
    }
}