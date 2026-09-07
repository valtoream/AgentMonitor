namespace AgentMonitor.Agent.Models
{
    public sealed class AntivirusInformation
    {
        public bool? IsInstalled { get; set; }

        public bool? IsEnabled { get; set; }

        public bool? IsUpToDate { get; set; }

        public int? SignatureAgeDays { get; set; }
    }
}