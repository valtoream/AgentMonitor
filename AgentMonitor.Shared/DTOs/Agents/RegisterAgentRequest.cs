using System.ComponentModel.DataAnnotations;

namespace AgentMonitor.Shared.DTOs.Agents
{
    public class RegisterAgentRequest
    {
        [Required]
        [MaxLength(128)]
        public string DeviceIdentifier { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Hostname { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Manufacturer { get; set; }

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(200)]
        public string? OperatingSystem { get; set; }

        [MaxLength(100)]
        public string? OperatingSystemVersion { get; set; }

        [MaxLength(200)]
        public string? ProcessorName { get; set; }

        [Range(0, long.MaxValue)]
        public long TotalMemoryBytes { get; set; }

        [Required]
        [MaxLength(20)]
        public string AgentVersion { get; set; } = string.Empty;
    }
}