using System.Management;
using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Licensing
{
    public sealed class WindowsActivationService
        : IWindowsActivationService
    {
        private readonly ILogger<WindowsActivationService> _logger;

        public WindowsActivationService(
            ILogger<WindowsActivationService> logger)
        {
            _logger = logger;
        }

        public Task<WindowsActivationInformation> CollectAsync(
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var result = new WindowsActivationInformation
            {
                WasCollectionSuccessful = false,
                IsActivated = null
            };

            try
            {
                using var searcher = new ManagementObjectSearcher(
                    @"SELECT LicenseStatus
                      FROM SoftwareLicensingProduct
                      WHERE PartialProductKey IS NOT NULL");

                foreach (ManagementObject item in searcher.Get())
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    object? value = item["LicenseStatus"];

                    if (value is null)
                    {
                        continue;
                    }

                    int licenseStatus = Convert.ToInt32(value);

                    result.IsActivated =
                        licenseStatus == 1;

                    result.WasCollectionSuccessful = true;

                    break;
                }

                _logger.LogInformation(
                    "Windows activation status collected: {Status}",
                    result.IsActivated);
            }
            catch (Exception exception)
            {
                _logger.LogWarning(
                    exception,
                    "Unable to determine Windows activation status.");
            }

            return Task.FromResult(result);
        }
    }
}