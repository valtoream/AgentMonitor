using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AgentMonitorAPI.Data
{
    public class AppDbContext : DbContext
    {
        private static readonly ValueConverter<DateTime, DateTime>
            UtcDateTimeConverter = new(
                value => value,
                value => DateTime.SpecifyKind(
                    value,
                    DateTimeKind.Utc));

        private static readonly ValueConverter<DateTime?, DateTime?>
            NullableUtcDateTimeConverter = new(
                value => value,
                value => value.HasValue
                    ? DateTime.SpecifyKind(
                        value.Value,
                        DateTimeKind.Utc)
                    : null);

        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<MonitoringRule> MonitoringRules =>
            Set<MonitoringRule>();

        public DbSet<RuleSimulationRun> RuleSimulationRuns =>
            Set<RuleSimulationRun>();

        public DbSet<Device> Devices =>
            Set<Device>();

        public DbSet<ShadowRuleEvaluation> ShadowRuleEvaluations =>
        Set<ShadowRuleEvaluation>();

        public DbSet<Agent> Agents =>
            Set<Agent>();

        public DbSet<HealthCheck> HealthChecks =>
            Set<HealthCheck>();

        public DbSet<Ticket> Tickets =>
            Set<Ticket>();

        public DbSet<AuditLog> AuditLogs =>
            Set<AuditLog>();

        public DbSet<DashboardUser> DashboardUsers =>
            Set<DashboardUser>();

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(
                typeof(AppDbContext).Assembly);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(
                            UtcDateTimeConverter);
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(
                            NullableUtcDateTimeConverter);
                    }
                }
            }
        }
    }
}