using AgentMonitor.Shared.DTOs.HealthChecks;
using AgentMonitorAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
namespace AgentMonitorAPI.Controllers;

[ApiController]
[Route("api/health-checks")]
[Authorize(
    AuthenticationSchemes = "DashboardJwt",
    Roles = "Viewer,Technician,Administrator")]
public sealed class HealthCheckDetailsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public HealthCheckDetailsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("{healthCheckId:guid}")]
    [ProducesResponseType<HealthCheckDetailsResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HealthCheckDetailsResponse>> GetById(
        Guid healthCheckId,
        CancellationToken cancellationToken)
    {
        var healthCheck = await _dbContext.HealthChecks
            .AsNoTracking()
            .Where(item => item.Id == healthCheckId)
            .Select(item => new HealthCheckDetailsResponse
            {
                Id = item.Id,
                DeviceId = item.DeviceId,

                CollectedAtUtc = item.CollectedAtUtc,
                ReceivedAtUtc = item.ReceivedAtUtc,

                LoggedOnUser = item.LoggedOnUser,

                HealthScore = item.HealthScore,
                Status = item.Status,

                TotalMemoryBytes = item.TotalMemoryBytes,
                AvailableMemoryBytes = item.AvailableMemoryBytes,

                SystemDriveTotalBytes = item.SystemDriveTotalBytes,
                SystemDriveFreeBytes = item.SystemDriveFreeBytes,
                DiskUsagePercent = item.DiskUsagePercent,

                IsAntivirusInstalled = item.IsAntivirusInstalled,
                IsAntivirusEnabled = item.IsAntivirusEnabled,
                IsAntivirusUpToDate = item.IsAntivirusUpToDate,

                IsWindowsActivated = item.IsWindowsActivated,

                PendingUpdatesCount = item.PendingUpdatesCount,
                LastWindowsUpdateAtUtc = item.LastWindowsUpdateAtUtc,

                InstalledSoftwareJson = item.InstalledSoftwareJson,
                NetworkConfigurationJson = item.NetworkConfigurationJson,
                IssuesJson = item.IssuesJson
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (healthCheck is null)
        {
            return NotFound(new
            {
                message = "Health check was not found."
            });
        }

        return Ok(healthCheck);
    }
}