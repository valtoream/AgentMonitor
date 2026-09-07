using System.Management;
using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Monitoring
{
    public sealed class SystemInformationService : ISystemInformationService
    {
        public Task<SystemInformation> CollectAsync(
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var result = new SystemInformation
            {
                Hostname = Environment.MachineName,
                OperatingSystem = Environment.OSVersion.VersionString,
                OperatingSystemVersion =
                    Environment.OSVersion.Version.ToString()
            };

            using (var computerSystemSearcher =
                   new ManagementObjectSearcher(
                       "SELECT Manufacturer, Model, TotalPhysicalMemory " +
                       "FROM Win32_ComputerSystem"))
            {
                foreach (ManagementObject item
                         in computerSystemSearcher.Get())
                {
                    result.Manufacturer =
                        item["Manufacturer"]?.ToString()
                        ?? string.Empty;

                    result.Model =
                        item["Model"]?.ToString()
                        ?? string.Empty;

                    if (ulong.TryParse(
                            item["TotalPhysicalMemory"]?.ToString(),
                            out ulong totalMemory))
                    {
                        result.TotalMemoryBytes =
                            totalMemory > long.MaxValue
                                ? long.MaxValue
                                : (long)totalMemory;
                    }

                    break;
                }
            }

            using (var operatingSystemSearcher =
                   new ManagementObjectSearcher(
                       "SELECT FreePhysicalMemory " +
                       "FROM Win32_OperatingSystem"))
            {
                foreach (ManagementObject item
                         in operatingSystemSearcher.Get())
                {
                    if (ulong.TryParse(
                            item["FreePhysicalMemory"]?.ToString(),
                            out ulong freeMemoryKilobytes))
                    {
                        ulong freeMemoryBytes =
                            freeMemoryKilobytes * 1024;

                        result.AvailableMemoryBytes =
                            freeMemoryBytes > long.MaxValue
                                ? long.MaxValue
                                : (long)freeMemoryBytes;
                    }

                    break;
                }
            }

            using (var processorSearcher =
                   new ManagementObjectSearcher(
                       "SELECT Name FROM Win32_Processor"))
            {
                foreach (ManagementObject item
                         in processorSearcher.Get())
                {
                    result.ProcessorName =
                        item["Name"]?.ToString()?.Trim()
                        ?? string.Empty;

                    break;
                }
            }

            return Task.FromResult(result);
        }
    }
}