using AgentMonitor.Shared.DTOs.HealthChecks;

namespace AgentMonitorAPI.Services.HealthChecks
{
    public interface IHealthCheckService
    {
        Task<SubmitHealthCheckResponse> SubmitAsync(
            Guid deviceId,
            SubmitHealthCheckRequest request,
            CancellationToken cancellationToken = default);
    }
}