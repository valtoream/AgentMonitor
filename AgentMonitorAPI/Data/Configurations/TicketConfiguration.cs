using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public sealed class TicketConfiguration
        : IEntityTypeConfiguration<Ticket>
    {
        public void Configure(
            EntityTypeBuilder<Ticket> builder)
        {
            builder.ToTable("Tickets");

            builder.HasKey(ticket => ticket.Id);

            builder.Property(ticket => ticket.Id)
                .ValueGeneratedNever();

            builder.Property(ticket => ticket.DeviceId)
                .IsRequired();

            builder.Property(ticket => ticket.RuleCode)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(ticket => ticket.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(ticket => ticket.Description)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(ticket => ticket.Severity)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(ticket => ticket.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(ticket => ticket.CreatedAtUtc)
                .IsRequired();

            builder.Property(ticket => ticket.LastDetectedAtUtc)
                .IsRequired();

            builder.Property(ticket => ticket.UpdatedAtUtc);

            builder.Property(ticket => ticket.ResolvedAtUtc);

            builder.Property(ticket => ticket.DetectionCount)
                .IsRequired()
                .HasDefaultValue(1);

            builder.HasOne(ticket => ticket.Device)
                .WithMany(device => device.Tickets)
                .HasForeignKey(ticket => ticket.DeviceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ticket => ticket.HealthCheck)
                .WithMany(healthCheck => healthCheck.Tickets)
                .HasForeignKey(ticket => ticket.HealthCheckId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(ticket => new
            {
                ticket.DeviceId,
                ticket.Status
            });

            builder.HasIndex(ticket => new
            {
                ticket.DeviceId,
                ticket.RuleCode,
                ticket.Status
            });

            builder.HasIndex(ticket => new
            {
                ticket.Status,
                ticket.Severity
            });

            builder.HasIndex(ticket => ticket.LastDetectedAtUtc);
        }
    }
}