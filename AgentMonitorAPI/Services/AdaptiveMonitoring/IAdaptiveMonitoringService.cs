using AgentMonitor.Shared.Enums;
using AgentMonitorAPI.Models;

namespace AgentMonitorAPI.Services.AdaptiveMonitoring
{
    public sealed record AdaptiveMonitoringDecision(
        MonitoringLevel Level,
        int RecommendedIntervalSeconds);

    public interface IAdaptiveMonitoringService
    {
        Task<AdaptiveMonitoringDecision> EvaluateAsync(
            HealthCheck healthCheck,
            CancellationToken cancellationToken = default);
    }
}