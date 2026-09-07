using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using AgentMonitorAPI.Services.Audit;
using AgentMonitorAPI.Services.Rules;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Services.Tickets
{
    public sealed class TicketService : ITicketService
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<TicketService> _logger;
        private readonly IAuditLogService _auditLogService;

        public TicketService(
            AppDbContext dbContext,
            ILogger<TicketService> logger,
            IAuditLogService auditLogService)
        {
            _dbContext = dbContext;
            _logger = logger;
            _auditLogService = auditLogService;
        }

        public async Task ProcessRuleResultsAsync(
            HealthCheck healthCheck,
            IReadOnlyList<RuleResult> triggeredRules,
            CancellationToken cancellationToken = default)
        {
            DateTime nowUtc = DateTime.UtcNow;

            List<Ticket> openTickets =
                await _dbContext.Tickets
                    .Where(ticket =>
                        ticket.DeviceId == healthCheck.DeviceId &&
                        ticket.Status == TicketStatus.Open)
                    .ToListAsync(cancellationToken);

            HashSet<string> triggeredRuleCodes =
                triggeredRules
                    .Select(result => result.RuleCode)
                    .ToHashSet(
                        StringComparer.OrdinalIgnoreCase);

            foreach (RuleResult result in triggeredRules)
            {
                Ticket? existingTicket =
                    openTickets.FirstOrDefault(ticket =>
                        string.Equals(
                            ticket.RuleCode,
                            result.RuleCode,
                            StringComparison.OrdinalIgnoreCase));

                if (existingTicket is null)
                {
                    var ticket = new Ticket
                    {
                        Id = Guid.NewGuid(),
                        DeviceId = healthCheck.DeviceId,
                        HealthCheckId = healthCheck.Id,
                        RuleCode = result.RuleCode,
                        Title = result.Title,
                        Description = result.Description,
                        Severity = result.Severity,
                        Status = TicketStatus.Open,
                        CreatedAtUtc = nowUtc,
                        LastDetectedAtUtc = nowUtc,
                        DetectionCount = 1
                    };

                    _dbContext.Tickets.Add(ticket);

                    _logger.LogInformation(
                        "Created ticket {RuleCode} for device {DeviceId}.",
                        result.RuleCode,
                        healthCheck.DeviceId);

                    continue;
                }

                existingTicket.HealthCheckId =
                    healthCheck.Id;

                existingTicket.Title =
                    result.Title;

                existingTicket.Description =
                    result.Description;

                existingTicket.Severity =
                    result.Severity;

                existingTicket.LastDetectedAtUtc =
                    nowUtc;

                existingTicket.UpdatedAtUtc =
                    nowUtc;

                existingTicket.DetectionCount++;

                _logger.LogInformation(
                    "Updated ticket {TicketId} for rule {RuleCode}.",
                    existingTicket.Id,
                    result.RuleCode);
            }

            foreach (Ticket ticket in openTickets)
            {
                if (triggeredRuleCodes.Contains(
                        ticket.RuleCode))
                {
                    continue;
                }

                ticket.Status =
                    TicketStatus.Resolved;

                ticket.ResolvedAtUtc =
                    nowUtc;

                ticket.UpdatedAtUtc =
                    nowUtc;

                _logger.LogInformation(
                    "Resolved ticket {TicketId} for rule {RuleCode}.",
                    ticket.Id,
                    ticket.RuleCode);

                await _auditLogService.WriteAsync(
                    userId: null,
                    username: "System",
                    action: "TicketAutoResolved",
                    entityType: "Ticket",
                    entityId: ticket.Id.ToString(),
                    details:
                        $"Automatically resolved ticket {ticket.RuleCode} " +
                        $"for device {healthCheck.DeviceId}.",
                    cancellationToken);
            }

            await _dbContext.SaveChangesAsync(
                cancellationToken);
        }
    }
}