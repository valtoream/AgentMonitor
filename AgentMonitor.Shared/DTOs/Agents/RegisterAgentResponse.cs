namespace AgentMonitor.Shared.DTOs.Agents
{
    public class RegisterAgentResponse
    {
        public Guid DeviceId { get; set; }

        public Guid AgentId { get; set; }

        public string ApiKey { get; set; } = string.Empty;

        public DateTime RegisteredAtUtc { get; set; }
    }
}