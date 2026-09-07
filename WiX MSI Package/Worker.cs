using System.Net;
using AgentMonitor.Agent.Configuration;
using AgentMonitor.Agent.Models;
using AgentMonitor.Agent.Services.HealthChecks;
using AgentMonitor.Agent.Services.Licensing;
using AgentMonitor.Agent.Services.Monitoring;
using AgentMonitor.Agent.Services.Network;
using AgentMonitor.Agent.Services.Registration;
using AgentMonitor.Agent.Services.Security;
using AgentMonitor.Agent.Services.Software;
using AgentMonitor.Agent.Services.Storage;
using AgentMonitor.Agent.Services.Updates;
using AgentMonitor.Shared.DTOs.HealthChecks;
using AgentMonitor.Shared.Enums;
using Microsoft.Extensions.Options;

namespace AgentMonitor.Agent
{
    public sealed class Worker : BackgroundService
    {
        private readonly IRegistrationService _registrationService;
        private readonly IAgentStateStore _agentStateStore;
        private readonly ISystemInformationService _systemInformationService;
        private readonly IAntivirusInformationService
            _antivirusInformationService;
        private readonly IWindowsUpdateInformationService
            _windowsUpdateInformationService;
        private readonly IInstalledSoftwareService
            _installedSoftwareService;
        private readonly INetworkInformationService
            _networkInformationService;
        private readonly IWindowsActivationService
            _windowsActivationService;
        private readonly IHealthCheckSubmissionService
            _healthCheckSubmissionService;
        private readonly AgentSettings _settings;
        private readonly ILogger<Worker> _logger;

        public Worker(
            IRegistrationService registrationService,
            IAgentStateStore agentStateStore,
            ISystemInformationService systemInformationService,
            IAntivirusInformationService antivirusInformationService,
            IWindowsUpdateInformationService windowsUpdateInformationService,
            IInstalledSoftwareService installedSoftwareService,
            INetworkInformationService networkInformationService,
            IWindowsActivationService windowsActivationService,
            IHealthCheckSubmissionService healthCheckSubmissionService,
            IOptions<AgentSettings> settings,
            ILogger<Worker> logger)
        {
            _registrationService =
                registrationService;

            _agentStateStore =
                agentStateStore;

            _systemInformationService =
                systemInformationService;

            _antivirusInformationService =
                antivirusInformationService;

            _windowsUpdateInformationService =
                windowsUpdateInformationService;

            _installedSoftwareService =
                installedSoftwareService;

            _networkInformationService =
                networkInformationService;

            _windowsActivationService =
                windowsActivationService;

            _healthCheckSubmissionService =
                healthCheckSubmissionService;

            _settings =
                settings.Value;

            _logger =
                logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            try
            {
                AgentRegistrationState state =
                    await GetOrCreateRegistrationWithRetryAsync(
                        stoppingToken);

                while (!stoppingToken.IsCancellationRequested)
                {
                    int nextIntervalSeconds =
                        GetNormalIntervalSeconds();

                    MonitoringLevel monitoringLevel =
                        MonitoringLevel.Normal;

                    try
                    {
                        SubmitHealthCheckResponse response =
                            await CollectAndSubmitHealthCheckAsync(
                                state,
                                stoppingToken);

                        monitoringLevel =
                            response.MonitoringLevel;

                        nextIntervalSeconds =
                            ResolveNextIntervalSeconds(
                                response);
                    }
                    catch (HttpRequestException exception)
                        when (exception.StatusCode ==
                              HttpStatusCode.Unauthorized)
                    {
                        _logger.LogWarning(
                            "The stored API key was rejected by the server. " +
                            "The agent will register again.");

                        state =
                            await ReRegisterWithRetryAsync(
                                stoppingToken);
                    }
                    catch (OperationCanceledException)
                        when (stoppingToken.IsCancellationRequested)
                    {
                        break;
                    }
                    catch (Exception exception)
                    {
                        _logger.LogError(
                            exception,
                            "Health check collection or submission failed.");
                    }

                    _logger.LogInformation(
                        "Next health check in {Seconds} seconds. " +
                        "Monitoring level: {MonitoringLevel}.",
                        nextIntervalSeconds,
                        monitoringLevel);

                    await Task.Delay(
                        TimeSpan.FromSeconds(
                            nextIntervalSeconds),
                        stoppingToken);
                }
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation(
                    "Agent is stopping.");
            }
            catch (Exception exception)
            {
                _logger.LogCritical(
                    exception,
                    "Agent stopped because of an unexpected fatal error.");
            }
        }

        private int ResolveNextIntervalSeconds(
            SubmitHealthCheckResponse response)
        {
            int normalIntervalSeconds =
                GetNormalIntervalSeconds();

            if (response.RecommendedIntervalSeconds <= 0)
            {
                return normalIntervalSeconds;
            }

            // Adaptive monitoring is allowed to make checks
            // more frequent, but never slower than the
            // configured normal interval.
            return Math.Max(
                1,
                Math.Min(
                    normalIntervalSeconds,
                    response.RecommendedIntervalSeconds));
        }

        private int GetNormalIntervalSeconds()
        {
            return Math.Max(
                1,
                _settings.CollectionIntervalSeconds);
        }

        private async Task<AgentRegistrationState>
            GetOrCreateRegistrationWithRetryAsync(
                CancellationToken cancellationToken)
        {
            AgentRegistrationState? state =
                await _agentStateStore.LoadAsync();

            if (IsValid(state))
            {
                LogRegistrationLoaded(state!);

                return state!;
            }

            _logger.LogInformation(
                "No valid local registration was found.");

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation(
                        "Attempting agent registration.");

                    await _registrationService.RegisterAsync(
                        cancellationToken);

                    state =
                        await _agentStateStore.LoadAsync();

                    if (!IsValid(state))
                    {
                        throw new InvalidOperationException(
                            "A valid agent registration could not be loaded.");
                    }

                    LogRegistrationLoaded(state!);

                    return state!;
                }
                catch (OperationCanceledException)
                    when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception exception)
                {
                    _logger.LogWarning(
                        exception,
                        "Agent registration failed. " +
                        "Retrying in {Seconds} seconds.",
                        _settings.RetryIntervalSeconds);

                    await DelayBeforeRetryAsync(
                        cancellationToken);
                }
            }

            throw new OperationCanceledException(
                cancellationToken);
        }

        private async Task<AgentRegistrationState>
            ReRegisterWithRetryAsync(
                CancellationToken cancellationToken)
        {
            await _agentStateStore.DeleteAsync();

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation(
                        "Attempting agent re-registration.");

                    await _registrationService.RegisterAsync(
                        cancellationToken);

                    AgentRegistrationState? state =
                        await _agentStateStore.LoadAsync();

                    if (!IsValid(state))
                    {
                        throw new InvalidOperationException(
                            "The agent could not load a valid registration " +
                            "after re-registering.");
                    }

                    _logger.LogInformation(
                        "Agent re-registration completed successfully. " +
                        "AgentId: {AgentId}, DeviceId: {DeviceId}.",
                        state!.AgentId,
                        state.DeviceId);

                    return state;
                }
                catch (OperationCanceledException)
                    when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception exception)
                {
                    _logger.LogWarning(
                        exception,
                        "Agent re-registration failed. " +
                        "Retrying in {Seconds} seconds.",
                        _settings.RetryIntervalSeconds);

                    await DelayBeforeRetryAsync(
                        cancellationToken);
                }
            }

            throw new OperationCanceledException(
                cancellationToken);
        }

        private async Task DelayBeforeRetryAsync(
            CancellationToken cancellationToken)
        {
            TimeSpan retryInterval =
                TimeSpan.FromSeconds(
                    _settings.RetryIntervalSeconds);

            await Task.Delay(
                retryInterval,
                cancellationToken);
        }

        private async Task<SubmitHealthCheckResponse>
            CollectAndSubmitHealthCheckAsync(
                AgentRegistrationState state,
                CancellationToken cancellationToken)
        {
            SystemInformation systemInformation =
                await _systemInformationService.CollectAsync(
                    cancellationToken);

            AntivirusInformation antivirusInformation =
                await _antivirusInformationService.CollectAsync(
                    cancellationToken);

            WindowsUpdateInformation windowsUpdateInformation =
                await _windowsUpdateInformationService.CollectAsync(
                    cancellationToken);

            IReadOnlyList<InstalledSoftware> installedSoftware =
                await _installedSoftwareService.CollectAsync(
                    cancellationToken);

            IReadOnlyList<NetworkAdapterInformation>
                networkInformation =
                    await _networkInformationService.CollectAsync(
                        cancellationToken);

            WindowsActivationInformation
                windowsActivationInformation =
                    await _windowsActivationService.CollectAsync(
                        cancellationToken);

            SubmitHealthCheckResponse response =
                await _healthCheckSubmissionService.SubmitAsync(
                    state,
                    systemInformation,
                    antivirusInformation,
                    windowsUpdateInformation,
                    installedSoftware,
                    networkInformation,
                    windowsActivationInformation,
                    cancellationToken);

            return response;
        }

        private void LogRegistrationLoaded(
            AgentRegistrationState state)
        {
            _logger.LogInformation(
                "Agent registration loaded. " +
                "AgentId: {AgentId}, DeviceId: {DeviceId}.",
                state.AgentId,
                state.DeviceId);
        }

        private static bool IsValid(
            AgentRegistrationState? state)
        {
            return state is not null
                   && state.AgentId != Guid.Empty
                   && state.DeviceId != Guid.Empty
                   && !string.IsNullOrWhiteSpace(
                       state.ApiKey);
        }
    }
}