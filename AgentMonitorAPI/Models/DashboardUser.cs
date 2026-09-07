using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Models
{
    public sealed class DashboardUser
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Username { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAtUtc { get; set; } =
            DateTime.UtcNow;

        public DateTime? LastLoginAtUtc { get; set; }
    }
}