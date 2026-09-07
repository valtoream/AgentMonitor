using System.Management;
using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Security
{
    public sealed class AntivirusInformationService
        : IAntivirusInformationService
    {
        private readonly ILogger<AntivirusInformationService> _logger;

        public AntivirusInformationService(
            ILogger<AntivirusInformationService> logger)
        {
            _logger = logger;
        }

        public Task<AntivirusInformation> CollectAsync(
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var result = new AntivirusInformation
            {
                IsInstalled = null,
                IsEnabled = null,
                IsUpToDate = null,
                SignatureAgeDays = null
            };

            try
            {
                var scope = new ManagementScope(
                    @"\\.\ROOT\Microsoft\Windows\Defender");

                scope.Connect();

                var query = new ObjectQuery(
                    "SELECT AntivirusEnabled, AntivirusSignatureAge " +
                    "FROM MSFT_MpComputerStatus");

                using var searcher =
                    new ManagementObjectSearcher(scope, query);

                using ManagementObjectCollection results =
                    searcher.Get();

                ManagementObject? item =
                    results
                        .Cast<ManagementObject>()
                        .FirstOrDefault();

                if (item is null)
                {
                    _logger.LogWarning(
                        "Microsoft Defender returned no status information.");

                    return Task.FromResult(result);
                }

                result.IsInstalled = true;

                if (item["AntivirusEnabled"] is bool enabled)
                {
                    result.IsEnabled = enabled;
                }
                else
                {
                    _logger.LogWarning(
                        "Microsoft Defender enabled status could not be determined.");
                }

                if (int.TryParse(
                        item["AntivirusSignatureAge"]?.ToString(),
                        out int signatureAgeDays))
                {
                    result.SignatureAgeDays = signatureAgeDays;

                    // Проектно правило:
                    // сигнатури на възраст до един ден се считат за актуални.
                    result.IsUpToDate = signatureAgeDays <= 1;
                }
                else
                {
                    _logger.LogWarning(
                        "Microsoft Defender signature age could not be determined.");
                }

                _logger.LogInformation(
                    "Microsoft Defender status collected. " +
                    "Installed: {Installed}, Enabled: {Enabled}, " +
                    "Signature age: {SignatureAgeDays}, Up to date: {UpToDate}.",
                    result.IsInstalled,
                    result.IsEnabled,
                    result.SignatureAgeDays,
                    result.IsUpToDate);
            }
            catch (UnauthorizedAccessException exception)
            {
                _logger.LogWarning(
                    exception,
                    "Access to Microsoft Defender status was denied.");
            }
            catch (ManagementException exception)
            {
                _logger.LogWarning(
                    exception,
                    "Microsoft Defender status could not be read.");
            }
            catch (Exception exception)
            {
                _logger.LogWarning(
                    exception,
                    "An unexpected error occurred while collecting Microsoft Defender status.");
            }

            return Task.FromResult(result);
        }
    }
}