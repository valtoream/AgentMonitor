using AgentMonitor.Shared.DTOs.Tickets;
using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Services.Tickets
{
    public sealed class TicketQueryService
        : ITicketQueryService
    {
        private readonly AppDbContext _dbContext;

        public TicketQueryService(
            AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyList<TicketListItemResponse>>
            GetTicketsAsync(
                TicketStatus? status,
                TicketSeverity? severity,
                Guid? deviceId,
                CancellationToken cancellationToken = default)
        {
            IQueryable<Ticket> query =
                _dbContext.Tickets
                    .AsNoTracking();

            if (status.HasValue)
            {
                query = query.Where(ticket =>
                    ticket.Status == status.Value);
            }

            if (severity.HasValue)
            {
                query = query.Where(ticket =>
                    ticket.Severity == severity.Value);
            }

            if (deviceId.HasValue)
            {
                query = query.Where(ticket =>
                    ticket.DeviceId == deviceId.Value);
            }

            return await query
                .OrderBy(ticket => ticket.Status)
                .ThenByDescending(ticket => ticket.Severity)
                .ThenByDescending(ticket => ticket.LastDetectedAtUtc)
                .Select(ticket => new TicketListItemResponse
                {
                    Id = ticket.Id,
                    DeviceId = ticket.DeviceId,
                    DeviceHostname = ticket.Device.Hostname,
                    RuleCode = ticket.RuleCode,
                    Title = ticket.Title,
                    Severity = ticket.Severity.ToString(),
                    Status = ticket.Status.ToString(),
                    CreatedAtUtc = ticket.CreatedAtUtc,
                    LastDetectedAtUtc = ticket.LastDetectedAtUtc,
                    ResolvedAtUtc = ticket.ResolvedAtUtc,
                    DetectionCount = ticket.DetectionCount
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<TicketDetailsResponse?>
            GetTicketByIdAsync(
                Guid ticketId,
                CancellationToken cancellationToken = default)
        {
            return await _dbContext.Tickets
                .AsNoTracking()
                .Where(ticket => ticket.Id == ticketId)
                .Select(ticket => new TicketDetailsResponse
                {
                    Id = ticket.Id,
                    DeviceId = ticket.DeviceId,
                    DeviceHostname = ticket.Device.Hostname,
                    HealthCheckId = ticket.HealthCheckId,
                    RuleCode = ticket.RuleCode,
                    Title = ticket.Title,
                    Description = ticket.Description,
                    Severity = ticket.Severity.ToString(),
                    Status = ticket.Status.ToString(),
                    CreatedAtUtc = ticket.CreatedAtUtc,
                    LastDetectedAtUtc = ticket.LastDetectedAtUtc,
                    UpdatedAtUtc = ticket.UpdatedAtUtc,
                    ResolvedAtUtc = ticket.ResolvedAtUtc,
                    DetectionCount = ticket.DetectionCount
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<TicketDetailsResponse?>
            ResolveTicketAsync(
                Guid ticketId,
                CancellationToken cancellationToken = default)
        {
            Ticket? ticket =
                await _dbContext.Tickets
                    .Include(ticket => ticket.Device)
                    .FirstOrDefaultAsync(
                        ticket => ticket.Id == ticketId,
                        cancellationToken);

            if (ticket is null)
            {
                return null;
            }

            if (ticket.Status != TicketStatus.Resolved &&
                ticket.Status != TicketStatus.Closed)
            {
                ticket.Status = TicketStatus.Resolved;
                ticket.ResolvedAtUtc = DateTime.UtcNow;
                ticket.UpdatedAtUtc = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync(
                    cancellationToken);
            }

            return new TicketDetailsResponse
            {
                Id = ticket.Id,
                DeviceId = ticket.DeviceId,
                DeviceHostname = ticket.Device.Hostname,
                HealthCheckId = ticket.HealthCheckId,
                RuleCode = ticket.RuleCode,
                Title = ticket.Title,
                Description = ticket.Description,
                Severity = ticket.Severity.ToString(),
                Status = ticket.Status.ToString(),
                CreatedAtUtc = ticket.CreatedAtUtc,
                LastDetectedAtUtc = ticket.LastDetectedAtUtc,
                UpdatedAtUtc = ticket.UpdatedAtUtc,
                ResolvedAtUtc = ticket.ResolvedAtUtc,
                DetectionCount = ticket.DetectionCount
            };
        }
    }
}