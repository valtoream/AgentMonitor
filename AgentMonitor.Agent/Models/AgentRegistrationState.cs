namespace AgentMonitor.Agent.Models
{
    public sealed class AgentRegistrationState
    {
        public Guid AgentId { get; set; }

        public Guid DeviceId { get; set; }

        public string ApiKey { get; set; } = string.Empty;

        public DateTime RegisteredAtUtc { get; set; }
    }
}