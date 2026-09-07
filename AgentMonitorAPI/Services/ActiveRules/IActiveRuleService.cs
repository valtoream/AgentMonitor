using AgentMonitorAPI.Models;
using AgentMonitorAPI.Services.Rules;

namespace AgentMonitorAPI.Services.ActiveRules
{
    public interface IActiveRuleService
    {
        Task<IReadOnlyList<RuleResult>> EvaluateAsync(
            HealthCheck healthCheck,
            CancellationToken cancellationToken = default);
    }
}