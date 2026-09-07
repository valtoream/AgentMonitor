using AgentMonitorAPI.Models;

namespace AgentMonitorAPI.Services.ShadowRules
{
    public interface IShadowRuleService
    {
        Task EvaluateAsync(
            HealthCheck healthCheck,
            CancellationToken cancellationToken = default);
    }
}