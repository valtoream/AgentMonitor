using AgentMonitorAPI.DTOs.RuleSimulation;

namespace AgentMonitorAPI.Services.RuleSimulation
{
    public interface IRuleSimulationService
    {
        Task<RuleSimulationResponse> SimulateAsync(
            SimulateRuleRequest request,
            CancellationToken cancellationToken = default);
    }
}