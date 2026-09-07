namespace AgentMonitor.Agent.Models
{
    public sealed class SystemInformation
    {
        public long AvailableMemoryBytes { get; set; }
        public string Hostname { get; set; } = string.Empty;

        public string Manufacturer { get; set; } = string.Empty;

        public string Model { get; set; } = string.Empty;

        public string OperatingSystem { get; set; } = string.Empty;

        public string OperatingSystemVersion { get; set; } = string.Empty;

        public string ProcessorName { get; set; } = string.Empty;

        public long TotalMemoryBytes { get; set; }
    }
}