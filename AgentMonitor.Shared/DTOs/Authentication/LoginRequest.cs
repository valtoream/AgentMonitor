using System.ComponentModel.DataAnnotations;

namespace AgentMonitor.Shared.DTOs.Authentication
{
    public sealed class LoginRequest
    {
        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}