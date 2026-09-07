using AgentMonitor.Shared.DTOs.Tickets;
using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/tickets")]
    [Authorize(
    AuthenticationSchemes = "DashboardJwt",
    Roles = "Viewer,Technician,Administrator")]
    public sealed class TicketsController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public TicketsController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        [ProducesResponseType(
            typeof(IReadOnlyList<TicketSummaryResponse>),
            StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<TicketSummaryResponse>>> GetAllAsync(
            [FromQuery] TicketStatus? status,
            CancellationToken cancellationToken)
        {
            IQueryable<Ticket> query =
                _dbContext.Tickets
                    .AsNoTracking();

            if (status.HasValue)
            {
                query = query.Where(ticket =>
                    ticket.Status == status.Value);
            }

            List<TicketSummaryResponse> tickets =
                await query
                    .OrderByDescending(ticket =>
                        ticket.CreatedAtUtc)
                    .Select(TicketSummaryProjection)
                    .ToListAsync(cancellationToken);

            return Ok(tickets);
        }

        [HttpGet("counts")]
        [ProducesResponseType(
            typeof(TicketCountsResponse),
            StatusCodes.Status200OK)]
        public async Task<ActionResult<TicketCountsResponse>> GetCountsAsync(
            CancellationToken cancellationToken)
        {
            int openCount =
                await _dbContext.Tickets
                    .AsNoTracking()
                    .CountAsync(
                        ticket =>
                            ticket.Status == TicketStatus.Open,
                        cancellationToken);

            int resolvedCount =
                await _dbContext.Tickets
                    .AsNoTracking()
                    .CountAsync(
                        ticket =>
                            ticket.Status == TicketStatus.Resolved,
                        cancellationToken);

            var response = new TicketCountsResponse
            {
                Open = openCount,
                Resolved = resolvedCount,
                All = openCount + resolvedCount
            };

            return Ok(response);
        }

        [HttpGet("{ticketId:guid}")]
        [ProducesResponseType(
            typeof(TicketSummaryResponse),
            StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TicketSummaryResponse>> GetByIdAsync(
            Guid ticketId,
            CancellationToken cancellationToken)
        {
            TicketSummaryResponse? ticket =
                await _dbContext.Tickets
                    .AsNoTracking()
                    .Where(ticket =>
                        ticket.Id == ticketId)
                    .Select(TicketSummaryProjection)
                    .SingleOrDefaultAsync(cancellationToken);

            if (ticket is null)
            {
                return NotFound();
            }

            return Ok(ticket);
        }

        private static readonly Expression<
            Func<Ticket, TicketSummaryResponse>>
            TicketSummaryProjection =
                ticket => new TicketSummaryResponse
                {
                    Id = ticket.Id,
                    DeviceId = ticket.DeviceId,
                    DeviceHostname = ticket.Device.Hostname,
                    RuleCode = ticket.RuleCode,
                    Title = ticket.Title,
                    Description = ticket.Description,
                    Severity = ticket.Severity.ToString(),
                    Status = ticket.Status.ToString(),
                    CreatedAtUtc = ticket.CreatedAtUtc,
                    LastDetectedAtUtc =
                        ticket.LastDetectedAtUtc,
                    ResolvedAtUtc =
                        ticket.ResolvedAtUtc,
                    DetectionCount =
                        ticket.DetectionCount
                };
    }
}