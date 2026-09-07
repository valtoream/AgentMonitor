using System.ComponentModel.DataAnnotations;

namespace AgentMonitorAPI.Models
{
    public class Agent
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid DeviceId { get; set; }

        [Required]
        [MaxLength(255)]
        public string ApiKeyHash { get; set; } = string.Empty;

        

        [MaxLength(20)]
        public string Version { get; set; } = "1.0.0";

        public bool IsActive { get; set; } = true;

        public DateTime RegisteredAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime? LastAuthenticatedAtUtc { get; set; }

        // Navigation Property
        public Device Device { get; set; } = null!;
    }
}