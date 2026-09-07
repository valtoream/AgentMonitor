using AgentMonitor.Shared.DTOs.Agents;
using AgentMonitor.Shared.Enums;
using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Security;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Services.Agents
{
    public sealed class AgentRegistrationService
        : IAgentRegistrationService
    {
        private readonly AppDbContext _dbContext;
        private readonly IApiKeyService _apiKeyService;

        public AgentRegistrationService(
            AppDbContext dbContext,
            IApiKeyService apiKeyService)
        {
            _dbContext = dbContext;
            _apiKeyService = apiKeyService;
        }

        public async Task<RegisterAgentResponse> RegisterAsync(
            RegisterAgentRequest request,
            CancellationToken cancellationToken = default)
        {
            string deviceIdentifier = request.DeviceIdentifier.Trim();
            DateTime nowUtc = DateTime.UtcNow;

            Device? existingDevice = await _dbContext.Devices
                .Include(device => device.Agent)
                .SingleOrDefaultAsync(
                    device => device.DeviceIdentifier == deviceIdentifier,
                    cancellationToken);

            if (existingDevice is not null)
            {
                existingDevice.Hostname = request.Hostname.Trim();
                existingDevice.Manufacturer =
                    NormalizeOptional(request.Manufacturer);
                existingDevice.Model =
                    NormalizeOptional(request.Model);
                existingDevice.OperatingSystem =
                    NormalizeOptional(request.OperatingSystem);
                existingDevice.OperatingSystemVersion =
                    NormalizeOptional(request.OperatingSystemVersion);
                existingDevice.ProcessorName =
                    NormalizeOptional(request.ProcessorName);
                existingDevice.TotalMemoryBytes =
                    request.TotalMemoryBytes;
                existingDevice.LastSeenAtUtc = nowUtc;

                if (existingDevice.Agent is null)
                {
                    throw new InvalidOperationException(
                        "The device exists, but its agent record is missing.");
                }

                GeneratedApiKey regeneratedApiKey =
                    _apiKeyService.Generate(existingDevice.Agent.Id);

                existingDevice.Agent.ApiKeyHash =
                    regeneratedApiKey.Hash;

                existingDevice.Agent.Version =
                    request.AgentVersion.Trim();

                existingDevice.Agent.IsActive = true;

                await _dbContext.SaveChangesAsync(cancellationToken);

                return new RegisterAgentResponse
                {
                    DeviceId = existingDevice.Id,
                    AgentId = existingDevice.Agent.Id,
                    ApiKey = regeneratedApiKey.FullKey,
                    RegisteredAtUtc = existingDevice.RegisteredAtUtc
                };
            }

            var device = new Device
            {
                Id = Guid.NewGuid(),
                DeviceIdentifier = deviceIdentifier,
                Hostname = request.Hostname.Trim(),
                Manufacturer =
                    NormalizeOptional(request.Manufacturer),
                Model =
                    NormalizeOptional(request.Model),
                OperatingSystem =
                    NormalizeOptional(request.OperatingSystem),
                OperatingSystemVersion =
                    NormalizeOptional(request.OperatingSystemVersion),
                ProcessorName =
                    NormalizeOptional(request.ProcessorName),
                TotalMemoryBytes = request.TotalMemoryBytes,
                HealthScore = 100,
                Status = DeviceStatus.Unknown,
                RegisteredAtUtc = nowUtc,
                LastSeenAtUtc = nowUtc
            };

            Guid agentId = Guid.NewGuid();

            GeneratedApiKey newAgentApiKey =
                _apiKeyService.Generate(agentId);

            var agent = new AgentMonitorAPI.Models.Agent
            {
                Id = agentId,
                DeviceId = device.Id,
                Device = device,
                ApiKeyHash = newAgentApiKey.Hash,
                Version = request.AgentVersion.Trim(),
                IsActive = true,
                RegisteredAtUtc = nowUtc
            };

            _dbContext.Devices.Add(device);
            _dbContext.Agents.Add(agent);

            await _dbContext.SaveChangesAsync(cancellationToken);

            return new RegisterAgentResponse
            {
                DeviceId = device.Id,
                AgentId = agent.Id,
                ApiKey = newAgentApiKey.FullKey,
                RegisteredAtUtc = nowUtc
            };
        }

        private static string? NormalizeOptional(string? value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? null
                : value.Trim();
        }
    }
}