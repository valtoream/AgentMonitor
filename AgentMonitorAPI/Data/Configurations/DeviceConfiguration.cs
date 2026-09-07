using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public class DeviceConfiguration : IEntityTypeConfiguration<Device>
    {
        public void Configure(EntityTypeBuilder<Device> builder)
        {
            builder.ToTable("Devices");

            builder.HasKey(device => device.Id);

            builder.Property(device => device.DeviceIdentifier)
                .IsRequired()
                .HasMaxLength(128);

            builder.HasIndex(device => device.DeviceIdentifier)
                .IsUnique();

            builder.Property(device => device.Hostname)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(device => device.Hostname);

            builder.Property(device => device.Manufacturer)
                .HasMaxLength(100);

            builder.Property(device => device.Model)
                .HasMaxLength(100);

            builder.Property(device => device.OperatingSystem)
                .HasMaxLength(200);

            builder.Property(device => device.OperatingSystemVersion)
                .HasMaxLength(100);

            builder.Property(device => device.ProcessorName)
                .HasMaxLength(200);

            builder.Property(device => device.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.HasOne(device => device.Agent)
                .WithOne(agent => agent.Device)
                .HasForeignKey<Agent>(agent => agent.DeviceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(device => device.HealthChecks)
                .WithOne(healthCheck => healthCheck.Device)
                .HasForeignKey(healthCheck => healthCheck.DeviceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(device => device.Tickets)
                .WithOne(ticket => ticket.Device)
                .HasForeignKey(ticket => ticket.DeviceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}