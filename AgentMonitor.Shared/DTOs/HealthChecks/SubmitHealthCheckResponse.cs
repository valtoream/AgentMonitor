using AgentMonitor.Shared.Enums;

namespace AgentMonitor.Shared.DTOs.HealthChecks
{
    public class SubmitHealthCheckResponse
    {
        public Guid HealthCheckId { get; set; }

        public int HealthScore { get; set; }

        public DeviceStatus Status { get; set; }

        public DateTime ReceivedAtUtc { get; set; }

        public MonitoringLevel MonitoringLevel { get; set; }
            = MonitoringLevel.Normal;

        public int RecommendedIntervalSeconds { get; set; }
    }
}