using AgentMonitor.Shared.DTOs.Audit;
using AgentMonitorAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/audit-logs")]
    [Authorize(
        AuthenticationSchemes = "DashboardJwt",
        Roles = "Administrator")]
    public sealed class AuditLogsController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public AuditLogsController(
            AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        [ProducesResponseType(
            typeof(IReadOnlyList<AuditLogResponse>),
            StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<AuditLogResponse>>>
            GetAllAsync(
                CancellationToken cancellationToken)
        {
            List<AuditLogResponse> logs =
                await _dbContext.AuditLogs
                    .AsNoTracking()
                    .OrderByDescending(
                        log => log.CreatedAtUtc)
                    .Take(500)
                    .Select(log =>
                        new AuditLogResponse
                        {
                            Id = log.Id,
                            UserId = log.UserId,
                            Username = log.Username,
                            Action = log.Action,
                            EntityType = log.EntityType,
                            EntityId = log.EntityId,
                            Details = log.Details,
                            CreatedAtUtc = log.CreatedAtUtc
                        })
                    .ToListAsync(cancellationToken);

            return Ok(logs);
        }
    }
}