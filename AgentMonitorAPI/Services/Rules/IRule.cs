using AgentMonitorAPI.Models;

namespace AgentMonitorAPI.Services.Rules
{
    public interface IRule
    {
        RuleResult Evaluate(
            HealthCheck healthCheck);
    }
}