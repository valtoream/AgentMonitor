namespace AgentMonitor.Agent.Models
{
    public sealed class WindowsUpdateInformation
    {
        public int PendingUpdatesCount { get; set; }

        public DateTime? LastWindowsUpdateAtUtc { get; set; }

        public bool WasCollectionSuccessful { get; set; }
    }
}