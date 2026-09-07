using AgentMonitor.Shared.Enums;

namespace AgentMonitor.Shared.DTOs.Devices;

public sealed class HealthCheckHistoryItemResponse
{
    public Guid Id { get; set; }

    public DateTime CollectedAtUtc { get; set; }

    public DateTime ReceivedAtUtc { get; set; }

    public int HealthScore { get; set; }

    public DeviceStatus Status { get; set; }

    public decimal DiskUsagePercent { get; set; }

    public long TotalMemoryBytes { get; set; }

    public long AvailableMemoryBytes { get; set; }

    public bool? IsAntivirusEnabled { get; set; }

    public int PendingUpdatesCount { get; set; }
}