using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Software
{
    public interface IInstalledSoftwareService
    {
        Task<IReadOnlyList<InstalledSoftware>> CollectAsync(
            CancellationToken cancellationToken = default);
    }
}