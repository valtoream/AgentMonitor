using System.Management;
using System.Net.Http.Json;
using AgentMonitor.Agent.Configuration;
using AgentMonitor.Agent.Models;
using AgentMonitor.Agent.Services.Storage;
using AgentMonitor.Shared.DTOs.Agents;
using Microsoft.Extensions.Options;
using Microsoft.Win32;

namespace AgentMonitor.Agent.Services.Registration
{
    public sealed class RegistrationService : IRegistrationService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AgentSettings _settings;
        private readonly IAgentStateStore _agentStateStore;
        private readonly ILogger<RegistrationService> _logger;

        public RegistrationService(
            IHttpClientFactory httpClientFactory,
            IOptions<AgentSettings> settings,
            IAgentStateStore agentStateStore,
            ILogger<RegistrationService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _settings = settings.Value;
            _agentStateStore = agentStateStore;
            _logger = logger;
        }

        public async Task<RegisterAgentResponse> RegisterAsync(
            CancellationToken cancellationToken = default)
        {
            var request = new RegisterAgentRequest
            {
                DeviceIdentifier = GetMachineGuid(),
                Hostname = Environment.MachineName,
                Manufacturer = GetComputerSystemValue("Manufacturer"),
                Model = GetComputerSystemValue("Model"),
                OperatingSystem = GetOperatingSystemCaption(),
                OperatingSystemVersion =
                    Environment.OSVersion.Version.ToString(),
                ProcessorName = GetProcessorName(),
                TotalMemoryBytes = GetTotalPhysicalMemoryBytes(),
                AgentVersion = "1.0.0"
            };

            HttpClient client = _httpClientFactory.CreateClient();

            string registerUrl =
                $"{_settings.ServerUrl.TrimEnd('/')}/api/agents/register";

            _logger.LogInformation(
                "Registering agent with server {ServerUrl}.",
                _settings.ServerUrl);

            using HttpResponseMessage response =
                await client.PostAsJsonAsync(
                    registerUrl,
                    request,
                    cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                string errorBody =
                    await response.Content.ReadAsStringAsync(
                        cancellationToken);

                throw new HttpRequestException(
                    $"Agent registration failed with status " +
                    $"{(int)response.StatusCode}: {errorBody}");
            }

            RegisterAgentResponse? registration =
                await response.Content
                    .ReadFromJsonAsync<RegisterAgentResponse>(
                        cancellationToken: cancellationToken);

            if (registration is null)
            {
                throw new InvalidOperationException(
                    "The server returned an invalid registration response.");
            }

            _logger.LogInformation(
                "Agent registered successfully with ID {AgentId}.",
                registration.AgentId);

            var state = new AgentRegistrationState
            {
                AgentId = registration.AgentId,
                DeviceId = registration.DeviceId,
                ApiKey = registration.ApiKey,
                RegisteredAtUtc = registration.RegisteredAtUtc
            };

            if (!string.IsNullOrWhiteSpace(registration.ApiKey))
            {
                await _agentStateStore.SaveAsync(state);
            }

            return registration;
        }

        private static string GetMachineGuid()
        {
            using RegistryKey? key =
                Registry.LocalMachine.OpenSubKey(
                    @"SOFTWARE\Microsoft\Cryptography");

            string? machineGuid =
                key?.GetValue("MachineGuid")?.ToString();

            if (string.IsNullOrWhiteSpace(machineGuid))
            {
                throw new InvalidOperationException(
                    "Windows MachineGuid could not be read.");
            }

            return machineGuid;
        }

        private static string? GetComputerSystemValue(
            string propertyName)
        {
            try
            {
                using var searcher = new ManagementObjectSearcher(
                    $"SELECT {propertyName} FROM Win32_ComputerSystem");

                foreach (ManagementObject item in searcher.Get())
                {
                    string? value =
                        item[propertyName]?.ToString()?.Trim();

                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        return value;
                    }
                }
            }
            catch
            {
                return null;
            }

            return null;
        }

        private static string? GetOperatingSystemCaption()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher(
                    "SELECT Caption FROM Win32_OperatingSystem");

                foreach (ManagementObject item in searcher.Get())
                {
                    string? value =
                        item["Caption"]?.ToString()?.Trim();

                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        return value;
                    }
                }
            }
            catch
            {
                return Environment.OSVersion.VersionString;
            }

            return Environment.OSVersion.VersionString;
        }

        private static string? GetProcessorName()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher(
                    "SELECT Name FROM Win32_Processor");

                foreach (ManagementObject item in searcher.Get())
                {
                    string? value =
                        item["Name"]?.ToString()?.Trim();

                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        return value;
                    }
                }
            }
            catch
            {
                return null;
            }

            return null;
        }

        private static long GetTotalPhysicalMemoryBytes()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher(
                    "SELECT TotalPhysicalMemory " +
                    "FROM Win32_ComputerSystem");

                foreach (ManagementObject item in searcher.Get())
                {
                    object? value = item["TotalPhysicalMemory"];

                    if (value is not null &&
                        long.TryParse(
                            value.ToString(),
                            out long totalMemoryBytes))
                    {
                        return totalMemoryBytes;
                    }
                }
            }
            catch
            {
                // Fallback below.
            }

            return GC.GetGCMemoryInfo().TotalAvailableMemoryBytes;
        }
    }
}