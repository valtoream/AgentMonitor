using AgentMonitorAPI.Models;
using AgentMonitorAPI.Services.Rules;

namespace AgentMonitorAPI.Services.Tickets
{
    public interface ITicketService
    {
        Task ProcessRuleResultsAsync(
            HealthCheck healthCheck,
            IReadOnlyList<RuleResult> triggeredRules,
            CancellationToken cancellationToken = default);
    }
}