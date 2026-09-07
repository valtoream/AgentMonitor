namespace AgentMonitor.Agent.Models
{
    public sealed class InstalledSoftware
    {
        public string Name { get; set; } = string.Empty;

        public string? Version { get; set; }

        public string? Publisher { get; set; }

        public DateTime? InstallDate { get; set; }
    }
}