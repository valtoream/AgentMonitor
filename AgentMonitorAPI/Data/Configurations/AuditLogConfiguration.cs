using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public sealed class AuditLogConfiguration
        : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(
            EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs");

            builder.HasKey(log => log.Id);

            builder.Property(log => log.Username)
                .HasMaxLength(100);

            builder.Property(log => log.Action)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(log => log.EntityType)
                .HasMaxLength(100);

            builder.Property(log => log.EntityId)
                .HasMaxLength(100);

            builder.Property(log => log.Details)
                .HasMaxLength(1000);

            builder.HasIndex(log =>
                log.CreatedAtUtc);

            builder.HasIndex(log =>
                log.UserId);

            builder.HasIndex(log =>
                log.Action);
        }
    }
}