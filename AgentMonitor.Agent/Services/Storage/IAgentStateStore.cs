using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Storage
{
    public interface IAgentStateStore
    {
        bool Exists();

        Task<AgentRegistrationState?> LoadAsync();

        Task SaveAsync(AgentRegistrationState state);

        Task DeleteAsync();
    }
}