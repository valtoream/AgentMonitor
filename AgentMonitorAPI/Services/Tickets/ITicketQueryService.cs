using AgentMonitor.Shared.DTOs.Tickets;
using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Services.Tickets
{
    public interface ITicketQueryService
    {
        Task<IReadOnlyList<TicketListItemResponse>> GetTicketsAsync(
            TicketStatus? status,
            TicketSeverity? severity,
            Guid? deviceId,
            CancellationToken cancellationToken = default);

        Task<TicketDetailsResponse?> GetTicketByIdAsync(
            Guid ticketId,
            CancellationToken cancellationToken = default);

        Task<TicketDetailsResponse?> ResolveTicketAsync(
            Guid ticketId,
            CancellationToken cancellationToken = default);
    }
}