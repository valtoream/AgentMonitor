using AgentMonitorAPI.Models;

namespace AgentMonitorAPI.Services.Rules
{
    public interface IRuleEngineService
    {
        IReadOnlyList<RuleResult> Evaluate(
            HealthCheck healthCheck);
    }
}