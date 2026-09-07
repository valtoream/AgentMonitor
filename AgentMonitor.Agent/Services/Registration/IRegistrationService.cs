using AgentMonitor.Shared.DTOs.Agents;

namespace AgentMonitor.Agent.Services.Registration
{
    public interface IRegistrationService
    {
        Task<RegisterAgentResponse> RegisterAsync(
            CancellationToken cancellationToken = default);
    }
}