using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Network
{
    public sealed class NetworkInformationService
        : INetworkInformationService
    {
        private readonly ILogger<NetworkInformationService> _logger;

        public NetworkInformationService(
            ILogger<NetworkInformationService> logger)
        {
            _logger = logger;
        }

        public Task<IReadOnlyList<NetworkAdapterInformation>> CollectAsync(
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var adapters = new List<NetworkAdapterInformation>();

            NetworkInterface[] networkInterfaces =
                NetworkInterface.GetAllNetworkInterfaces();

            foreach (NetworkInterface networkInterface in networkInterfaces)
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    NetworkAdapterInformation? adapter =
                        CreateAdapterInformation(networkInterface);

                    if (adapter is not null)
                    {
                        adapters.Add(adapter);
                    }
                }
                catch (Exception exception)
                {
                    _logger.LogWarning(
                        exception,
                        "Failed to collect information for network adapter {AdapterName}.",
                        networkInterface.Name);
                }
            }

            List<NetworkAdapterInformation> result = adapters
                .OrderByDescending(adapter => adapter.IsUp)
                .ThenByDescending(adapter => adapter.IsWireless)
                .ThenBy(adapter => adapter.Name)
                .ToList();

            _logger.LogInformation(
                "Collected information for {AdapterCount} relevant network adapters.",
                result.Count);

            return Task.FromResult<IReadOnlyList<NetworkAdapterInformation>>(
                result);
        }

        private static NetworkAdapterInformation?
            CreateAdapterInformation(
                NetworkInterface networkInterface)
        {
            if (ShouldIgnoreAdapter(networkInterface))
            {
                return null;
            }

            IPInterfaceProperties ipProperties =
                networkInterface.GetIPProperties();

            IReadOnlyList<string> ipv4Addresses =
                GetIpAddresses(
                    ipProperties,
                    AddressFamily.InterNetwork);

            IReadOnlyList<string> ipv6Addresses =
                GetIpAddresses(
                    ipProperties,
                    AddressFamily.InterNetworkV6);

            IReadOnlyList<string> dnsServers =
                GetDnsServers(ipProperties);

            IReadOnlyList<string> defaultGateways =
                GetDefaultGateways(ipProperties);

            bool isDhcpEnabled =
                GetDhcpStatus(ipProperties);

            return new NetworkAdapterInformation
            {
                Name = networkInterface.Name,

                Description = networkInterface.Description,

                MacAddress = FormatMacAddress(
                    networkInterface.GetPhysicalAddress()),

                IPv4Addresses = ipv4Addresses,

                IPv6Addresses = ipv6Addresses,

                DnsServers = dnsServers,

                DefaultGateways = defaultGateways,

                IsDhcpEnabled = isDhcpEnabled,

                IsWireless =
                    networkInterface.NetworkInterfaceType
                    == NetworkInterfaceType.Wireless80211,

                IsUp =
                    networkInterface.OperationalStatus
                    == OperationalStatus.Up,

                SpeedBitsPerSecond =
                    networkInterface.Speed
            };
        }

        private static bool ShouldIgnoreAdapter(
            NetworkInterface networkInterface)
        {
            if (networkInterface.NetworkInterfaceType
                == NetworkInterfaceType.Loopback)
            {
                return true;
            }

            if (networkInterface.NetworkInterfaceType
                == NetworkInterfaceType.Tunnel)
            {
                return true;
            }

            string name =
                networkInterface.Name ?? string.Empty;

            string description =
                networkInterface.Description ?? string.Empty;

            string combinedValue =
                $"{name} {description}";

            string[] ignoredKeywords =
            {
                "Loopback",
                "Pseudo-Interface",
                "Teredo",
                "isatap",
                "6to4 Adapter",

                "Npcap Packet Driver",
                "QoS Packet Scheduler",
                "WFP 802.3",
                "WFP Native",
                "Native WiFi Filter Driver",
                "Virtual WiFi Filter Driver",
                "VirtualBox NDIS Light-Weight Filter",

                "WAN Miniport",
                "Kernel Debug",
                "Microsoft Wi-Fi Direct Virtual Adapter",

                "Packet Scheduler",
                "LightWeight Filter",
                "Light-Weight Filter",
                "Network Monitor"
            };

            if (ignoredKeywords.Any(
                    keyword => combinedValue.Contains(
                        keyword,
                        StringComparison.OrdinalIgnoreCase)))
            {
                return true;
            }

            bool hasMeaningfulType =
                networkInterface.NetworkInterfaceType
                is NetworkInterfaceType.Ethernet
                or NetworkInterfaceType.GigabitEthernet
                or NetworkInterfaceType.FastEthernetFx
                or NetworkInterfaceType.FastEthernetT
                or NetworkInterfaceType.Wireless80211
                or NetworkInterfaceType.Ppp;

            if (!hasMeaningfulType)
            {
                return true;
            }

            return false;
        }

        private static IReadOnlyList<string> GetIpAddresses(
            IPInterfaceProperties ipProperties,
            AddressFamily addressFamily)
        {
            return ipProperties.UnicastAddresses
                .Where(address =>
                    address.Address.AddressFamily == addressFamily)
                .Select(address =>
                    address.Address.ToString())
                .Where(address =>
                    !string.IsNullOrWhiteSpace(address))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(address => address)
                .ToList();
        }

        private static IReadOnlyList<string> GetDnsServers(
            IPInterfaceProperties ipProperties)
        {
            return ipProperties.DnsAddresses
                .Where(address =>
                    address.AddressFamily
                        == AddressFamily.InterNetwork
                    ||
                    address.AddressFamily
                        == AddressFamily.InterNetworkV6)
                .Select(address =>
                    address.ToString())
                .Where(address =>
                    !string.IsNullOrWhiteSpace(address))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(address => address)
                .ToList();
        }

        private static IReadOnlyList<string> GetDefaultGateways(
            IPInterfaceProperties ipProperties)
        {
            return ipProperties.GatewayAddresses
                .Select(gateway =>
                    gateway.Address)
                .Where(address =>
                    address is not null
                    &&
                    !IPAddress.Any.Equals(address)
                    &&
                    !IPAddress.IPv6Any.Equals(address))
                .Select(address =>
                    address.ToString())
                .Where(address =>
                    !string.IsNullOrWhiteSpace(address))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(address => address)
                .ToList();
        }

        private static bool GetDhcpStatus(
            IPInterfaceProperties ipProperties)
        {
            try
            {
                IPv4InterfaceProperties? ipv4Properties =
                    ipProperties.GetIPv4Properties();

                return ipv4Properties?.IsDhcpEnabled ?? false;
            }
            catch (NetworkInformationException)
            {
                return false;
            }
            catch (PlatformNotSupportedException)
            {
                return false;
            }
        }

        private static string FormatMacAddress(
            PhysicalAddress physicalAddress)
        {
            byte[] bytes =
                physicalAddress.GetAddressBytes();

            if (bytes.Length == 0)
            {
                return string.Empty;
            }

            return string.Join(
                ":",
                bytes.Select(
                    value => value.ToString("X2")));
        }
    }
}