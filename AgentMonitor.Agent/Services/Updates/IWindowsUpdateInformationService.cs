using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Updates
{
    public interface IWindowsUpdateInformationService
    {
        Task<WindowsUpdateInformation> CollectAsync(
            CancellationToken cancellationToken = default);
    }
}