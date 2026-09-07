using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Licensing
{
    public interface IWindowsActivationService
    {
        Task<WindowsActivationInformation> CollectAsync(
            CancellationToken cancellationToken = default);
    }
}