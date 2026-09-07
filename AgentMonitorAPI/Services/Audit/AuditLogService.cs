using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;

namespace AgentMonitorAPI.Services.Audit
{
    public sealed class AuditLogService
        : IAuditLogService
    {
        private readonly AppDbContext _dbContext;

        public AuditLogService(
            AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task WriteAsync(
            Guid? userId,
            string? username,
            string action,
            string? entityType = null,
            string? entityId = null,
            string? details = null,
            CancellationToken cancellationToken = default)
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Username = username,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details,
                CreatedAtUtc = DateTime.UtcNow
            };

            _dbContext.AuditLogs.Add(
                auditLog);

            await _dbContext.SaveChangesAsync(
                cancellationToken);
        }
    }
}