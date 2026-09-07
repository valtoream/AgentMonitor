using System.ComponentModel.DataAnnotations;

namespace AgentMonitor.Agent.Configuration
{
    public sealed class AgentSettings
    {
        public const string SectionName = "AgentSettings";

        [Required]
        public string ServerUrl { get; set; } =
            string.Empty;

        [Range(10, 86400)]
        public int CollectionIntervalSeconds { get; set; } =
            300;

        [Range(5, 3600)]
        public int RetryIntervalSeconds { get; set; } =
            30;

        [Required]
        public string RegistrationFile { get; set; } =
            "agent.json";
    }
}