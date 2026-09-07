using System.ComponentModel.DataAnnotations;

namespace AgentMonitor.Shared.DTOs.Users
{
    public sealed class CreateUserRequest
    {
        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;
    }
}