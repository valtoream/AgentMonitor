namespace AgentMonitor.Agent.Models
{
    public sealed class NetworkAdapterInformation
    {
        public required string Name { get; set; }

        public required string Description { get; set; }

        public required string MacAddress { get; set; }

        public required IReadOnlyList<string> IPv4Addresses { get; set; }

        public required IReadOnlyList<string> IPv6Addresses { get; set; }

        public required IReadOnlyList<string> DnsServers { get; set; }

        public required IReadOnlyList<string> DefaultGateways { get; set; }

        public bool IsDhcpEnabled { get; set; }

        public bool IsWireless { get; set; }

        public bool IsUp { get; set; }

        public long SpeedBitsPerSecond { get; set; }
    }
}