using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Security
{
    public interface IAntivirusInformationService
    {
        Task<AntivirusInformation> CollectAsync(
            CancellationToken cancellationToken = default);
    }
}