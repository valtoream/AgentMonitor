namespace AgentMonitorAPI.Services.Audit
{
    public interface IAuditLogService
    {
        Task WriteAsync(
            Guid? userId,
            string? username,
            string action,
            string? entityType = null,
            string? entityId = null,
            string? details = null,
            CancellationToken cancellationToken = default);
    }
}