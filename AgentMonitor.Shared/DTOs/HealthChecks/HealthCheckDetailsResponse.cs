using AgentMonitor.Shared.Enums;

namespace AgentMonitor.Shared.DTOs.HealthChecks;

public sealed class HealthCheckDetailsResponse
{
    public Guid Id { get; set; }

    public Guid DeviceId { get; set; }

    public DateTime CollectedAtUtc { get; set; }

    public DateTime ReceivedAtUtc { get; set; }

    public string? LoggedOnUser { get; set; }

    public int HealthScore { get; set; }

    public DeviceStatus Status { get; set; }

    public long TotalMemoryBytes { get; set; }

    public long AvailableMemoryBytes { get; set; }

    public long SystemDriveTotalBytes { get; set; }

    public long SystemDriveFreeBytes { get; set; }

    public decimal DiskUsagePercent { get; set; }

    public bool? IsAntivirusInstalled { get; set; }

    public bool? IsAntivirusEnabled { get; set; }

    public bool? IsAntivirusUpToDate { get; set; }

    public bool? IsWindowsActivated { get; set; }

    public int PendingUpdatesCount { get; set; }

    public DateTime? LastWindowsUpdateAtUtc { get; set; }

    public string? InstalledSoftwareJson { get; set; }

    public string? NetworkConfigurationJson { get; set; }

    public string? IssuesJson { get; set; }
}