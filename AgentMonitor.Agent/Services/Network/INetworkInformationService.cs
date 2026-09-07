using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Network
{
    public interface INetworkInformationService
    {
        Task<IReadOnlyList<NetworkAdapterInformation>> CollectAsync(
            CancellationToken cancellationToken = default);
    }
}