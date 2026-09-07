using AgentMonitor.Agent.Models;
using AgentMonitor.Shared.DTOs.HealthChecks;

namespace AgentMonitor.Agent.Services.HealthChecks
{
    public interface IHealthCheckSubmissionService
    {
        Task<SubmitHealthCheckResponse> SubmitAsync(
            AgentRegistrationState state,
            SystemInformation systemInformation,
            AntivirusInformation antivirusInformation,
            WindowsUpdateInformation windowsUpdateInformation,
            IReadOnlyList<InstalledSoftware> installedSoftware,
            IReadOnlyList<NetworkAdapterInformation> networkInformation,
            WindowsActivationInformation windowsActivationInformation,
            CancellationToken cancellationToken = default);
    }
}