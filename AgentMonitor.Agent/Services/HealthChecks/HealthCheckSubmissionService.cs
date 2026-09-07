using System.Management;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using AgentMonitor.Agent.Configuration;
using AgentMonitor.Agent.Models;
using AgentMonitor.Shared.DTOs.HealthChecks;
using Microsoft.Extensions.Options;

namespace AgentMonitor.Agent.Services.HealthChecks
{
    public sealed class HealthCheckSubmissionService
        : IHealthCheckSubmissionService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AgentSettings _settings;
        private readonly ILogger<HealthCheckSubmissionService> _logger;

        public HealthCheckSubmissionService(
            IHttpClientFactory httpClientFactory,
            IOptions<AgentSettings> settings,
            ILogger<HealthCheckSubmissionService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<SubmitHealthCheckResponse> SubmitAsync(
            AgentRegistrationState state,
            SystemInformation systemInformation,
            AntivirusInformation antivirusInformation,
            WindowsUpdateInformation windowsUpdateInformation,
            IReadOnlyList<InstalledSoftware> installedSoftware,
            IReadOnlyList<NetworkAdapterInformation> networkInformation,
            WindowsActivationInformation windowsActivationInformation,
            CancellationToken cancellationToken = default)
        {
            DriveInfo systemDrive = GetSystemDrive();

            long totalDriveBytes =
                systemDrive.TotalSize;

            long freeDriveBytes =
                systemDrive.AvailableFreeSpace;

            decimal diskUsagePercent = totalDriveBytes == 0
                ? 0
                : Math.Round(
                    (decimal)(totalDriveBytes - freeDriveBytes)
                    / totalDriveBytes * 100,
                    2);

            var jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true
            };

            string installedSoftwareJson =
                JsonSerializer.Serialize(
                    installedSoftware,
                    jsonOptions);

            string networkConfigurationJson =
                JsonSerializer.Serialize(
                    networkInformation,
                    jsonOptions);

#if DEBUG
            SaveJsonFile(
                "installed-software.json",
                installedSoftwareJson);

            SaveJsonFile(
                "network-information.json",
                networkConfigurationJson);
#endif

            var request = new SubmitHealthCheckRequest
            {
                CollectedAtUtc =
                    DateTime.UtcNow,

                LoggedOnUser =
                    GetLoggedOnUser(),

                TotalMemoryBytes =
                    systemInformation.TotalMemoryBytes,

                AvailableMemoryBytes =
                    systemInformation.AvailableMemoryBytes,

                SystemDriveTotalBytes =
                    totalDriveBytes,

                SystemDriveFreeBytes =
                    freeDriveBytes,

                DiskUsagePercent =
                    diskUsagePercent,

                IsAntivirusInstalled =
                    antivirusInformation.IsInstalled,

                IsAntivirusEnabled =
                    antivirusInformation.IsEnabled,

                IsAntivirusUpToDate =
                    antivirusInformation.IsUpToDate,

                PendingUpdatesCount =
                    windowsUpdateInformation.PendingUpdatesCount,

                LastWindowsUpdateAtUtc =
                    windowsUpdateInformation.LastWindowsUpdateAtUtc,

                IsWindowsActivated =
                    windowsActivationInformation.IsActivated,

                InstalledSoftwareJson =
                    installedSoftwareJson,

                NetworkConfigurationJson =
                    networkConfigurationJson
            };

            HttpClient client =
                _httpClientFactory.CreateClient();

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    state.ApiKey);

            string endpoint =
                $"{_settings.ServerUrl.TrimEnd('/')}/api/healthchecks";

            _logger.LogInformation(
                "Submitting health check to {Endpoint}.",
                endpoint);

            using HttpResponseMessage response =
                await client.PostAsJsonAsync(
                    endpoint,
                    request,
                    cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                string errorBody =
                    await response.Content.ReadAsStringAsync(
                        cancellationToken);

                throw new HttpRequestException(
                    message:
                        $"Health check submission failed with status " +
                        $"{(int)response.StatusCode}: {errorBody}",
                    inner:
                        null,
                    statusCode:
                        response.StatusCode);
            }

            SubmitHealthCheckResponse? result =
                await response.Content
                    .ReadFromJsonAsync<SubmitHealthCheckResponse>(
                        cancellationToken: cancellationToken);

            if (result is null)
            {
                throw new InvalidOperationException(
                    "The server returned an invalid health check response.");
            }

            _logger.LogInformation(
                "Health check submitted successfully. " +
                "Score: {HealthScore}, Status: {Status}, " +
                "Logged-on user: {LoggedOnUser}, " +
                "Windows activated: {IsWindowsActivated}, " +
                "Installed applications: {InstalledSoftwareCount}, " +
                "Network adapters: {NetworkAdapterCount}.",
                result.HealthScore,
                result.Status,
                request.LoggedOnUser ?? "No interactive user",
                windowsActivationInformation.IsActivated,
                installedSoftware.Count,
                networkInformation.Count);

            return result;
        }

        private static string? GetLoggedOnUser()
        {
            try
            {
                using var searcher =
                    new ManagementObjectSearcher(
                        "SELECT UserName FROM Win32_ComputerSystem");

                using ManagementObjectCollection results =
                    searcher.Get();

                foreach (ManagementObject result in results)
                {
                    string? userName =
                        result["UserName"]?.ToString();

                    if (string.IsNullOrWhiteSpace(userName))
                    {
                        continue;
                    }

                    userName = userName.Trim();

                    return userName.Length <= 255
                        ? userName
                        : userName[..255];
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        private static DriveInfo GetSystemDrive()
        {
            string systemDirectory =
                Environment.SystemDirectory;

            string? driveRoot =
                Path.GetPathRoot(systemDirectory);

            if (string.IsNullOrWhiteSpace(driveRoot))
            {
                throw new InvalidOperationException(
                    "The Windows system drive could not be determined.");
            }

            var drive =
                new DriveInfo(driveRoot);

            if (!drive.IsReady)
            {
                throw new InvalidOperationException(
                    "The Windows system drive is not ready.");
            }

            return drive;
        }

#if DEBUG
        private static void SaveJsonFile(
            string fileName,
            string json)
        {
            string directoryPath =
                Path.Combine(
                    Environment.GetFolderPath(
                        Environment.SpecialFolder.CommonApplicationData),
                    "AgentMonitor");

            Directory.CreateDirectory(
                directoryPath);

            string filePath =
                Path.Combine(
                    directoryPath,
                    fileName);

            File.WriteAllText(
                filePath,
                json,
                Encoding.UTF8);
        }
#endif
    }
}