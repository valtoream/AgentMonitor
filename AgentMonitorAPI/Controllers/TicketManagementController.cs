using System.Security.Claims;
using AgentMonitor.Shared.DTOs.Tickets;
using AgentMonitorAPI.Models.Enums;
using AgentMonitorAPI.Services.Audit;
using AgentMonitorAPI.Services.Tickets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/ticket-management")]
    [Authorize(
        AuthenticationSchemes = "DashboardJwt",
        Roles = "Viewer,Technician,Administrator")]
    public sealed class TicketManagementController : ControllerBase
    {
        private readonly ITicketQueryService _ticketQueryService;
        private readonly IAuditLogService _auditLogService;

        public TicketManagementController(
            ITicketQueryService ticketQueryService,
            IAuditLogService auditLogService)
        {
            _ticketQueryService = ticketQueryService;
            _auditLogService = auditLogService;
        }

        [HttpGet]
        [ProducesResponseType(
            typeof(IReadOnlyList<TicketListItemResponse>),
            StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<TicketListItemResponse>>>
            GetTickets(
                [FromQuery] TicketStatus? status,
                [FromQuery] TicketSeverity? severity,
                [FromQuery] Guid? deviceId,
                CancellationToken cancellationToken)
        {
            IReadOnlyList<TicketListItemResponse> tickets =
                await _ticketQueryService.GetTicketsAsync(
                    status,
                    severity,
                    deviceId,
                    cancellationToken);

            return Ok(tickets);
        }

        [HttpGet("{ticketId:guid}")]
        [ProducesResponseType(
            typeof(TicketDetailsResponse),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TicketDetailsResponse>>
            GetTicket(
                Guid ticketId,
                CancellationToken cancellationToken)
        {
            TicketDetailsResponse? ticket =
                await _ticketQueryService.GetTicketByIdAsync(
                    ticketId,
                    cancellationToken);

            if (ticket is null)
            {
                return NotFound();
            }

            return Ok(ticket);
        }

        [HttpPost("{ticketId:guid}/resolve")]
        [Authorize(
            AuthenticationSchemes = "DashboardJwt",
            Roles = "Technician,Administrator")]
        [ProducesResponseType(
            typeof(TicketDetailsResponse),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(
            StatusCodes.Status403Forbidden)]
        [ProducesResponseType(
            StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TicketDetailsResponse>>
            ResolveTicket(
                Guid ticketId,
                CancellationToken cancellationToken)
        {
            TicketDetailsResponse? ticket =
                await _ticketQueryService.ResolveTicketAsync(
                    ticketId,
                    cancellationToken);

            if (ticket is null)
            {
                return NotFound();
            }

            Guid? userId =
                GetCurrentUserId();

            string? username =
                User.FindFirstValue(
                    ClaimTypes.Name);

            await _auditLogService.WriteAsync(
                userId,
                username,
                "TicketResolved",
                "Ticket",
                ticket.Id.ToString(),
                $"Resolved ticket {ticket.RuleCode} for device {ticket.DeviceHostname}.",
                cancellationToken);

            return Ok(ticket);
        }

        private Guid? GetCurrentUserId()
        {
            string? userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (Guid.TryParse(
                    userId,
                    out Guid parsedUserId))
            {
                return parsedUserId;
            }

            return null;
        }
    }
}