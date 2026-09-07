using AgentMonitorAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgentMonitorAPI.Data.Configurations
{
    public sealed class DashboardUserConfiguration
        : IEntityTypeConfiguration<DashboardUser>
    {
        public void Configure(
            EntityTypeBuilder<DashboardUser> builder)
        {
            builder.ToTable("DashboardUsers");

            builder.HasKey(user => user.Id);

            builder.Property(user => user.Username)
                .HasMaxLength(100)
                .IsRequired();

            builder.HasIndex(user => user.Username)
                .IsUnique();

            builder.Property(user => user.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(user => user.Role)
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(user => user.IsActive)
                .HasDefaultValue(true);

            builder.Property(user => user.CreatedAtUtc)
                .IsRequired();
        }
    }
}