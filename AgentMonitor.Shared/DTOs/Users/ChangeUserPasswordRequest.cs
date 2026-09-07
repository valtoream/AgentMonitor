using System.ComponentModel.DataAnnotations;

namespace AgentMonitor.Shared.DTOs.Users
{
    public sealed class ChangeUserPasswordRequest
    {
        [Required]
        [MinLength(8)]
        [MaxLength(128)]
        public string NewPassword { get; set; } = string.Empty;
    }
}