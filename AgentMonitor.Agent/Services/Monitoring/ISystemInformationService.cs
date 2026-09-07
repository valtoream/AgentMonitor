using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Monitoring
{
    public interface ISystemInformationService
    {
        Task<SystemInformation> CollectAsync(
            CancellationToken cancellationToken = default);
    }
}