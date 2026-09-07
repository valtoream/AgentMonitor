namespace AgentMonitor.Agent.Models
{
    public sealed class WindowsActivationInformation
    {
        public bool? IsActivated { get; set; }

        public bool WasCollectionSuccessful { get; set; }
    }
}