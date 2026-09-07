using System.Globalization;
using AgentMonitor.Agent.Models;
using Microsoft.Win32;

namespace AgentMonitor.Agent.Services.Software
{
    public sealed class InstalledSoftwareService
        : IInstalledSoftwareService
    {
        private readonly ILogger<InstalledSoftwareService> _logger;

        public InstalledSoftwareService(
            ILogger<InstalledSoftwareService> logger)
        {
            _logger = logger;
        }

        public Task<IReadOnlyList<InstalledSoftware>> CollectAsync(
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var software = new List<InstalledSoftware>();

            ReadRegistryHive(
                Registry.LocalMachine,
                @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                software,
                cancellationToken);

            ReadRegistryHive(
                Registry.LocalMachine,
                @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall",
                software,
                cancellationToken);

            ReadRegistryHive(
                Registry.CurrentUser,
                @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                software,
                cancellationToken);

            List<InstalledSoftware> normalizedSoftware = software
                .GroupBy(
                    item => new
                    {
                        Name = item.Name.ToUpperInvariant(),
                        Version = item.Version?.ToUpperInvariant(),
                        Publisher = item.Publisher?.ToUpperInvariant()
                    })
                .Select(group => group.First())
                .OrderBy(
                    item => item.Name,
                    StringComparer.OrdinalIgnoreCase)
                .ToList();

            _logger.LogInformation(
                "Collected {Count} installed applications.",
                normalizedSoftware.Count);

            return Task.FromResult<IReadOnlyList<InstalledSoftware>>(
                normalizedSoftware);
        }

        private static void ReadRegistryHive(
            RegistryKey root,
            string path,
            ICollection<InstalledSoftware> software,
            CancellationToken cancellationToken)
        {
            using RegistryKey? uninstallKey =
                root.OpenSubKey(path);

            if (uninstallKey is null)
            {
                return;
            }

            foreach (string subKeyName in uninstallKey.GetSubKeyNames())
            {
                cancellationToken.ThrowIfCancellationRequested();

                using RegistryKey? applicationKey =
                    uninstallKey.OpenSubKey(subKeyName);

                if (applicationKey is null)
                {
                    continue;
                }

                string? name =
                    applicationKey
                        .GetValue("DisplayName")
                        ?.ToString()
                        ?.Trim();

                if (string.IsNullOrWhiteSpace(name))
                {
                    continue;
                }

                if (IsSystemComponent(applicationKey))
                {
                    continue;
                }

                if (IsUpdateOrHotfix(applicationKey))
                {
                    continue;
                }

                if (HasParentApplication(applicationKey))
                {
                    continue;
                }

                var installedSoftware = new InstalledSoftware
                {
                    Name = name,

                    Version = GetTrimmedValue(
                        applicationKey,
                        "DisplayVersion"),

                    Publisher = GetTrimmedValue(
                        applicationKey,
                        "Publisher"),

                    InstallDate = ParseInstallDate(
                        GetTrimmedValue(
                            applicationKey,
                            "InstallDate"))
                };

                software.Add(installedSoftware);
            }
        }

        private static bool IsSystemComponent(
            RegistryKey applicationKey)
        {
            object? value =
                applicationKey.GetValue("SystemComponent");

            if (value is null)
            {
                return false;
            }

            return int.TryParse(
                       value.ToString(),
                       out int systemComponent)
                   && systemComponent == 1;
        }

        private static bool IsUpdateOrHotfix(
            RegistryKey applicationKey)
        {
            string? releaseType =
                GetTrimmedValue(
                    applicationKey,
                    "ReleaseType");

            if (string.IsNullOrWhiteSpace(releaseType))
            {
                return false;
            }

            return releaseType.Contains(
                       "Update",
                       StringComparison.OrdinalIgnoreCase)
                   ||
                   releaseType.Contains(
                       "Hotfix",
                       StringComparison.OrdinalIgnoreCase)
                   ||
                   releaseType.Contains(
                       "Security Update",
                       StringComparison.OrdinalIgnoreCase);
        }

        private static bool HasParentApplication(
            RegistryKey applicationKey)
        {
            string? parentKeyName =
                GetTrimmedValue(
                    applicationKey,
                    "ParentKeyName");

            return !string.IsNullOrWhiteSpace(parentKeyName);
        }

        private static string? GetTrimmedValue(
            RegistryKey registryKey,
            string valueName)
        {
            string? value =
                registryKey
                    .GetValue(valueName)
                    ?.ToString()
                    ?.Trim();

            return string.IsNullOrWhiteSpace(value)
                ? null
                : value;
        }

        private static DateTime? ParseInstallDate(
            string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            string[] supportedFormats =
            {
                "yyyyMMdd",
                "yyyy-MM-dd",
                "MM/dd/yyyy",
                "M/d/yyyy",
                "dd/MM/yyyy",
                "d/M/yyyy"
            };

            if (DateTime.TryParseExact(
                    value,
                    supportedFormats,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out DateTime exactDate))
            {
                return DateTime.SpecifyKind(
                    exactDate.Date,
                    DateTimeKind.Utc);
            }

            if (DateTime.TryParse(
                    value,
                    CultureInfo.CurrentCulture,
                    DateTimeStyles.None,
                    out DateTime parsedDate))
            {
                return DateTime.SpecifyKind(
                    parsedDate.Date,
                    DateTimeKind.Utc);
            }

            return null;
        }
    }
}