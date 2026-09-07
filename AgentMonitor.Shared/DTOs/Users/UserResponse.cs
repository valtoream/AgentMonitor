namespace AgentMonitor.Shared.DTOs.Users
{
    public sealed class UserResponse
    {
        public Guid Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public DateTime CreatedAtUtc { get; set; }

        public DateTime? LastLoginAtUtc { get; set; }
    }
}