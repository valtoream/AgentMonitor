using AgentMonitor.Shared.DTOs.Devices;
using AgentMonitorAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/devices")]
    [Authorize(
      AuthenticationSchemes = "DashboardJwt",
      Roles = "Viewer,Technician,Administrator")]
    
    public sealed class DevicesController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public DevicesController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        [ProducesResponseType(
            typeof(IReadOnlyList<DeviceSummaryResponse>),
            StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<DeviceSummaryResponse>>> GetAllAsync(
            CancellationToken cancellationToken)
        {
            List<DeviceSummaryResponse> devices =
                await _dbContext.Devices
                    .AsNoTracking()
                    .OrderBy(device => device.Hostname)
                    .Select(device => new DeviceSummaryResponse
                    {
                        Id = device.Id,
                        Hostname = device.Hostname,

                        LoggedOnUser = device.HealthChecks
                            .OrderByDescending(
                                healthCheck =>
                                    healthCheck.CollectedAtUtc)
                            .Select(
                                healthCheck =>
                                    healthCheck.LoggedOnUser)
                            .FirstOrDefault(),

                        Manufacturer = device.Manufacturer,
                        Model = device.Model,
                        OperatingSystem = device.OperatingSystem,
                        TotalMemoryBytes = device.TotalMemoryBytes,
                        HealthScore = device.HealthScore,
                        Status = device.Status,
                        RegisteredAtUtc = device.RegisteredAtUtc,
                        LastSeenAtUtc = device.LastSeenAtUtc
                    })
                    .ToListAsync(cancellationToken);

            return Ok(devices);
        }

        [HttpGet("{deviceId:guid}")]
        [ProducesResponseType(
            typeof(DeviceSummaryResponse),
            StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DeviceSummaryResponse>> GetByIdAsync(
            Guid deviceId,
            CancellationToken cancellationToken)
        {
            DeviceSummaryResponse? device =
                await _dbContext.Devices
                    .AsNoTracking()
                    .Where(device => device.Id == deviceId)
                    .Select(device => new DeviceSummaryResponse
                    {
                        Id = device.Id,
                        Hostname = device.Hostname,

                        LoggedOnUser = device.HealthChecks
                            .OrderByDescending(
                                healthCheck =>
                                    healthCheck.CollectedAtUtc)
                            .Select(
                                healthCheck =>
                                    healthCheck.LoggedOnUser)
                            .FirstOrDefault(),

                        Manufacturer = device.Manufacturer,
                        Model = device.Model,
                        OperatingSystem = device.OperatingSystem,
                        TotalMemoryBytes = device.TotalMemoryBytes,
                        HealthScore = device.HealthScore,
                        Status = device.Status,
                        RegisteredAtUtc = device.RegisteredAtUtc,
                        LastSeenAtUtc = device.LastSeenAtUtc
                    })
                    .SingleOrDefaultAsync(cancellationToken);

            if (device is null)
            {
                return NotFound();
            }

            return Ok(device);
        }

        [HttpGet("{deviceId:guid}/details")]
        [ProducesResponseType(
            typeof(DeviceDetailsResponse),
            StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DeviceDetailsResponse>> GetDetailsAsync(
            Guid deviceId,
            CancellationToken cancellationToken)
        {
            DeviceDetailsResponse? device =
                await _dbContext.Devices
                    .AsNoTracking()
                    .Where(device => device.Id == deviceId)
                    .Select(device => new DeviceDetailsResponse
                    {
                        Id = device.Id,
                        DeviceIdentifier = device.DeviceIdentifier,
                        Hostname = device.Hostname,
                        Manufacturer = device.Manufacturer,
                        Model = device.Model,
                        OperatingSystem = device.OperatingSystem,

                        OperatingSystemVersion =
                            device.OperatingSystemVersion,

                        ProcessorName =
                            device.ProcessorName,

                        TotalMemoryBytes =
                            device.TotalMemoryBytes,

                        HealthScore =
                            device.HealthScore,

                        Status =
                            device.Status,

                        RegisteredAtUtc =
                            device.RegisteredAtUtc,

                        LastSeenAtUtc =
                            device.LastSeenAtUtc,

                        LatestHealthCheck = device.HealthChecks
                            .OrderByDescending(
                                healthCheck =>
                                    healthCheck.CollectedAtUtc)
                            .Select(
                                healthCheck =>
                                    new LatestHealthCheckResponse
                                    {
                                        Id =
                                            healthCheck.Id,

                                        CollectedAtUtc =
                                            healthCheck.CollectedAtUtc,

                                        ReceivedAtUtc =
                                            healthCheck.ReceivedAtUtc,

                                        LoggedOnUser =
                                            healthCheck.LoggedOnUser,

                                        TotalMemoryBytes =
                                            healthCheck.TotalMemoryBytes,

                                        AvailableMemoryBytes =
                                            healthCheck.AvailableMemoryBytes,

                                        SystemDriveTotalBytes =
                                            healthCheck.SystemDriveTotalBytes,

                                        SystemDriveFreeBytes =
                                            healthCheck.SystemDriveFreeBytes,

                                        DiskUsagePercent =
                                            healthCheck.DiskUsagePercent,

                                        IsAntivirusInstalled =
                                            healthCheck.IsAntivirusInstalled,

                                        IsAntivirusEnabled =
                                            healthCheck.IsAntivirusEnabled,

                                        IsAntivirusUpToDate =
                                            healthCheck.IsAntivirusUpToDate,

                                        PendingUpdatesCount =
                                            healthCheck.PendingUpdatesCount,

                                        LastWindowsUpdateAtUtc =
                                            healthCheck.LastWindowsUpdateAtUtc,

                                        IsWindowsActivated =
                                            healthCheck.IsWindowsActivated,

                                        HealthScore =
                                            healthCheck.HealthScore,

                                        Status =
                                            healthCheck.Status,

                                        InstalledSoftwareJson =
                                            healthCheck.InstalledSoftwareJson,

                                        NetworkConfigurationJson =
                                            healthCheck.NetworkConfigurationJson,

                                        IssuesJson =
                                            healthCheck.IssuesJson
                                    })
                            .FirstOrDefault()
                    })
                    .SingleOrDefaultAsync(cancellationToken);

            if (device is null)
            {
                return NotFound();
            }

            return Ok(device);
        }

        [HttpGet("{deviceId:guid}/health-checks")]
        [ProducesResponseType(
       typeof(PagedHealthCheckHistoryResponse),
       StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PagedHealthCheckHistoryResponse>>
       GetHealthCheckHistoryAsync(
           Guid deviceId,
           [FromQuery] int page = 1,
           [FromQuery] int pageSize = 50,
           CancellationToken cancellationToken = default)
        {
            if (page < 1)
            {
                page = 1;
            }

            pageSize = Math.Clamp(pageSize, 10, 100);

            bool deviceExists =
                await _dbContext.Devices
                    .AsNoTracking()
                    .AnyAsync(
                        device => device.Id == deviceId,
                        cancellationToken);

            if (!deviceExists)
            {
                return NotFound();
            }

            IQueryable<AgentMonitorAPI.Models.HealthCheck> query =
                _dbContext.HealthChecks
                    .AsNoTracking()
                    .Where(
                        healthCheck =>
                            healthCheck.DeviceId == deviceId);

            int totalCount =
                await query.CountAsync(cancellationToken);

            int totalPages =
                totalCount == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalCount / (double)pageSize);

            if (totalPages > 0 && page > totalPages)
            {
                page = totalPages;
            }

            List<HealthCheckHistoryItemResponse> items =
                await query
                    .OrderByDescending(
                        healthCheck =>
                            healthCheck.CollectedAtUtc)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(
                        healthCheck =>
                            new HealthCheckHistoryItemResponse
                            {
                                Id =
                                    healthCheck.Id,

                                CollectedAtUtc =
                                    healthCheck.CollectedAtUtc,

                                ReceivedAtUtc =
                                    healthCheck.ReceivedAtUtc,

                                HealthScore =
                                    healthCheck.HealthScore,

                                Status =
                                    healthCheck.Status,

                                DiskUsagePercent =
                                    healthCheck.DiskUsagePercent,

                                TotalMemoryBytes =
                                    healthCheck.TotalMemoryBytes,

                                AvailableMemoryBytes =
                                    healthCheck.AvailableMemoryBytes,

                                IsAntivirusEnabled =
                                    healthCheck.IsAntivirusEnabled,

                                PendingUpdatesCount =
                                    healthCheck.PendingUpdatesCount
                            })
                    .ToListAsync(cancellationToken);

            return Ok(
                new PagedHealthCheckHistoryResponse
                {
                    Items = items,
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = totalPages
                });
        }
    }
}
