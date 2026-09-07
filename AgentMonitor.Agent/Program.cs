using AgentMonitor.Agent.Configuration;
using AgentMonitor.Agent.Services.HealthChecks;
using AgentMonitor.Agent.Services.Licensing;
using AgentMonitor.Agent.Services.Monitoring;
using AgentMonitor.Agent.Services.Network;
using AgentMonitor.Agent.Services.Registration;
using AgentMonitor.Agent.Services.Security;
using AgentMonitor.Agent.Services.Software;
using AgentMonitor.Agent.Services.Storage;
using AgentMonitor.Agent.Services.Updates;
using Microsoft.Extensions.Configuration;
using Microsoft.Win32;

namespace AgentMonitor.Agent
{
    public class Program
    {
        private const string RegistryPath =
            @"SOFTWARE\AgentMonitor";

        private const string ServerUrlRegistryValue =
            "ServerUrl";

        public static void Main(string[] args)
        {
            var builder =
                Host.CreateApplicationBuilder(args);

            // ProgramData configuration directory
            string programDataDirectory =
                Path.Combine(
                    Environment.GetFolderPath(
                        Environment.SpecialFolder.CommonApplicationData),
                    "AgentMonitor");

            Directory.CreateDirectory(
                programDataDirectory);

            string programDataSettingsPath =
                Path.Combine(
                    programDataDirectory,
                    "appsettings.json");

            // Optional configuration stored in ProgramData.
            builder.Configuration.AddJsonFile(
                programDataSettingsPath,
                optional: true,
                reloadOnChange: true);

            // Registry configuration written by the MSI installer.
            string? registryServerUrl =
                ReadServerUrlFromRegistry();

            if (!string.IsNullOrWhiteSpace(
                    registryServerUrl))
            {
                builder.Configuration.AddInMemoryCollection(
                    new Dictionary<string, string?>
                    {
                        [
                            $"{AgentSettings.SectionName}:ServerUrl"
                        ] = registryServerUrl
                    });
            }

            builder.Services.AddWindowsService(options =>
            {
                options.ServiceName =
                    "Agent Monitor";
            });

            builder.Services
                .AddOptions<AgentSettings>()
                .Bind(
                    builder.Configuration.GetSection(
                        AgentSettings.SectionName))
                .ValidateDataAnnotations()
                .ValidateOnStart();

            builder.Services.AddHttpClient();

            builder.Services.AddSingleton<
                IAgentStateStore,
                AgentStateStore>();

            builder.Services.AddSingleton<
                IRegistrationService,
                RegistrationService>();

            builder.Services.AddSingleton<
                ISystemInformationService,
                SystemInformationService>();

            builder.Services.AddSingleton<
                IAntivirusInformationService,
                AntivirusInformationService>();

            builder.Services.AddSingleton<
                IWindowsUpdateInformationService,
                WindowsUpdateInformationService>();

            builder.Services.AddSingleton<
                IInstalledSoftwareService,
                InstalledSoftwareService>();

            builder.Services.AddSingleton<
                INetworkInformationService,
                NetworkInformationService>();

            builder.Services.AddSingleton<
                IWindowsActivationService,
                WindowsActivationService>();

            builder.Services.AddSingleton<
                IHealthCheckSubmissionService,
                HealthCheckSubmissionService>();

            builder.Services.AddHostedService<Worker>();

            var host =
                builder.Build();

            host.Run();
        }

        private static string? ReadServerUrlFromRegistry()
        {
            if (!OperatingSystem.IsWindows())
            {
                return null;
            }

            try
            {
                using RegistryKey baseKey =
                    RegistryKey.OpenBaseKey(
                        RegistryHive.LocalMachine,
                        RegistryView.Registry64);

                using RegistryKey? key =
                    baseKey.OpenSubKey(
                        RegistryPath,
                        writable: false);

                return key?
                    .GetValue(
                        ServerUrlRegistryValue)?
                    .ToString();
            }
            catch
            {
                // Registry configuration is optional.
                // Agent falls back to appsettings.json.
                return null;
            }
        }
    }
}