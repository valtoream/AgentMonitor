using AgentMonitor.Shared.DTOs.Agents;

namespace AgentMonitorAPI.Services.Agents
{
    public interface IAgentRegistrationService
    {
        Task<RegisterAgentResponse> RegisterAsync(
            RegisterAgentRequest request,
            CancellationToken cancellationToken = default);
    }
}