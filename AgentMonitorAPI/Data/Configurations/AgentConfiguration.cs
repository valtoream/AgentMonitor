using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public class AgentConfiguration : IEntityTypeConfiguration<Agent>
    {
        public void Configure(EntityTypeBuilder<Agent> builder)
        {
            builder.ToTable("Agents");

            builder.HasKey(agent => agent.Id);

            builder.Property(agent => agent.ApiKeyHash)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(agent => agent.Version)
                .IsRequired()
                .HasMaxLength(20);

            builder.HasIndex(agent => agent.DeviceId)
                .IsUnique();

            builder.Property(agent => agent.IsActive)
                .HasDefaultValue(true);
        }
    }
}