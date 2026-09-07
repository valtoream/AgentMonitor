using System.Globalization;
using System.Management;
using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Updates
{
    public sealed class WindowsUpdateInformationService
        : IWindowsUpdateInformationService
    {
        private readonly ILogger<WindowsUpdateInformationService> _logger;

        public WindowsUpdateInformationService(
            ILogger<WindowsUpdateInformationService> logger)
        {
            _logger = logger;
        }

        public Task<WindowsUpdateInformation> CollectAsync(
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var result = new WindowsUpdateInformation
            {
                PendingUpdatesCount = 0,
                LastWindowsUpdateAtUtc = null,
                WasCollectionSuccessful = false
            };

            try
            {
                result.PendingUpdatesCount =
                    GetPendingUpdatesCount();

                result.LastWindowsUpdateAtUtc =
                    GetLastInstalledUpdateUtc();

                result.WasCollectionSuccessful = true;

                _logger.LogInformation(
                    "Windows Update information collected. " +
                    "Pending updates: {PendingUpdatesCount}, " +
                    "Last installed update: {LastWindowsUpdateAtUtc}.",
                    result.PendingUpdatesCount,
                    result.LastWindowsUpdateAtUtc);
            }
            catch (Exception exception)
            {
                _logger.LogWarning(
                    exception,
                    "Windows Update information could not be collected.");
            }

            return Task.FromResult(result);
        }

        private static int GetPendingUpdatesCount()
        {
            Type? sessionType =
                Type.GetTypeFromProgID(
                    "Microsoft.Update.Session");

            if (sessionType is null)
            {
                throw new InvalidOperationException(
                    "Windows Update Agent is not available.");
            }

            dynamic? updateSession =
                Activator.CreateInstance(sessionType);

            if (updateSession is null)
            {
                throw new InvalidOperationException(
                    "Windows Update session could not be created.");
            }

            try
            {
                dynamic updateSearcher =
                    updateSession.CreateUpdateSearcher();

                dynamic searchResult =
                    updateSearcher.Search(
                        "IsInstalled=0 AND IsHidden=0");

                return Convert.ToInt32(
                    searchResult.Updates.Count);
            }
            finally
            {
                if (updateSession is not null &&
                    System.Runtime.InteropServices.Marshal
                        .IsComObject(updateSession))
                {
                    System.Runtime.InteropServices.Marshal
                        .FinalReleaseComObject(updateSession);
                }
            }
        }

        private static DateTime? GetLastInstalledUpdateUtc()
        {
            DateTime? newestInstalledDate = null;

            using var searcher =
                new ManagementObjectSearcher(
                    "SELECT InstalledOn " +
                    "FROM Win32_QuickFixEngineering");

            foreach (ManagementObject item in searcher.Get())
            {
                string? installedOnText =
                    item["InstalledOn"]?.ToString();

                if (string.IsNullOrWhiteSpace(installedOnText))
                {
                    continue;
                }

                if (!TryParseInstalledDate(
                        installedOnText,
                        out DateTime installedDate))
                {
                    continue;
                }

                DateTime installedDateUtc =
                    DateTime.SpecifyKind(
                        installedDate,
                        DateTimeKind.Local)
                    .ToUniversalTime();

                if (newestInstalledDate is null ||
                    installedDateUtc > newestInstalledDate)
                {
                    newestInstalledDate =
                        installedDateUtc;
                }
            }

            return newestInstalledDate;
        }

        private static bool TryParseInstalledDate(
            string value,
            out DateTime installedDate)
        {
            string[] formats =
            {
                "M/d/yyyy",
                "MM/dd/yyyy",
                "d/M/yyyy",
                "dd/MM/yyyy",
                "yyyy-MM-dd"
            };

            return DateTime.TryParseExact(
                       value,
                       formats,
                       CultureInfo.InvariantCulture,
                       DateTimeStyles.None,
                       out installedDate)
                   ||
                   DateTime.TryParse(
                       value,
                       CultureInfo.CurrentCulture,
                       DateTimeStyles.None,
                       out installedDate);
        }
    }
}