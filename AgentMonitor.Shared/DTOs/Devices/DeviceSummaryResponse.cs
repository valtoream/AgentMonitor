using AgentMonitor.Shared.Enums;

namespace AgentMonitor.Shared.DTOs.Devices
{
    public sealed class DeviceSummaryResponse
    {
        public Guid Id { get; set; }

        public string Hostname { get; set; } = string.Empty;

        public string? Manufacturer { get; set; }

        public string? LoggedOnUser { get; set; }
        public string? Model { get; set; }

        public string? OperatingSystem { get; set; }

        public long TotalMemoryBytes { get; set; }

        public int HealthScore { get; set; }

        public DeviceStatus Status { get; set; }

        public DateTime RegisteredAtUtc { get; set; }

        public DateTime? LastSeenAtUtc { get; set; }
    }
}