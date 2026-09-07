using AgentMonitor.Shared.Enums;

namespace AgentMonitor.Shared.DTOs.Devices
{
    public sealed class DeviceDetailsResponse
    {
        public Guid Id { get; set; }

        public string DeviceIdentifier { get; set; } = string.Empty;

        public string Hostname { get; set; } = string.Empty;

        public string? Manufacturer { get; set; }

        public string? Model { get; set; }

        public string? OperatingSystem { get; set; }

        public string? OperatingSystemVersion { get; set; }

        public string? ProcessorName { get; set; }

        public long TotalMemoryBytes { get; set; }

        public int HealthScore { get; set; }

        public DeviceStatus Status { get; set; }

        public DateTime RegisteredAtUtc { get; set; }

        public DateTime? LastSeenAtUtc { get; set; }

        public LatestHealthCheckResponse? LatestHealthCheck { get; set; }
    }

    public sealed class LatestHealthCheckResponse
    {
        public Guid Id { get; set; }

        public DateTime CollectedAtUtc { get; set; }

        public DateTime ReceivedAtUtc { get; set; }

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

        public int HealthScore { get; set; }

        public DeviceStatus Status { get; set; }

        public string? InstalledSoftwareJson { get; set; }

        public string? NetworkConfigurationJson { get; set; }

        public string? IssuesJson { get; set; }
    }
}