using System.Text.Json.Serialization;

namespace AgentMonitorAPI.Models.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MonitoringMetric
    {
        DiskUsagePercent,
        MemoryUsagePercent,
        PendingUpdatesCount
    }
}