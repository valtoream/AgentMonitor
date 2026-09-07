using System.Text.Json;
using AgentMonitor.Shared.DTOs.HealthChecks;
using AgentMonitor.Shared.Enums;
using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Services.ActiveRules;
using AgentMonitorAPI.Services.AdaptiveMonitoring;
using AgentMonitorAPI.Services.Rules;
using AgentMonitorAPI.Services.ShadowRules;
using AgentMonitorAPI.Services.Tickets;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Services.HealthChecks
{
    public sealed class HealthCheckService : IHealthCheckService
    {
        private readonly AppDbContext _dbContext;
        private readonly IRuleEngineService _ruleEngineService;
        private readonly IActiveRuleService _activeRuleService;
        private readonly ITicketService _ticketService;
        private readonly IShadowRuleService _shadowRuleService;
        private readonly IAdaptiveMonitoringService
            _adaptiveMonitoringService;

        public HealthCheckService(
            AppDbContext dbContext,
            IRuleEngineService ruleEngineService,
            IActiveRuleService activeRuleService,
            ITicketService ticketService,
            IShadowRuleService shadowRuleService,
            IAdaptiveMonitoringService adaptiveMonitoringService)
        {
            _dbContext = dbContext;
            _ruleEngineService = ruleEngineService;
            _activeRuleService = activeRuleService;
            _ticketService = ticketService;
            _shadowRuleService = shadowRuleService;
            _adaptiveMonitoringService =
                adaptiveMonitoringService;
        }

        public async Task<SubmitHealthCheckResponse> SubmitAsync(
            Guid deviceId,
            SubmitHealthCheckRequest request,
            CancellationToken cancellationToken = default)
        {
            Device? device =
                await _dbContext.Devices
                    .SingleOrDefaultAsync(
                        device =>
                            device.Id == deviceId,
                        cancellationToken);

            if (device is null)
            {
                throw new InvalidOperationException(
                    "The registered device could not be found.");
            }

            DateTime receivedAtUtc =
                DateTime.UtcNow;

            var healthCheck = new HealthCheck
            {
                Id = Guid.NewGuid(),

                DeviceId = deviceId,

                CollectedAtUtc =
                    request.CollectedAtUtc,

                ReceivedAtUtc =
                    receivedAtUtc,

                LoggedOnUser =
                    request.LoggedOnUser,

                TotalMemoryBytes =
                    request.TotalMemoryBytes,

                AvailableMemoryBytes =
                    request.AvailableMemoryBytes,

                SystemDriveTotalBytes =
                    request.SystemDriveTotalBytes,

                SystemDriveFreeBytes =
                    request.SystemDriveFreeBytes,

                DiskUsagePercent =
                    request.DiskUsagePercent,

                IsAntivirusInstalled =
                    request.IsAntivirusInstalled,

                IsAntivirusEnabled =
                    request.IsAntivirusEnabled,

                IsAntivirusUpToDate =
                    request.IsAntivirusUpToDate,

                PendingUpdatesCount =
                    request.PendingUpdatesCount,

                LastWindowsUpdateAtUtc =
                    request.LastWindowsUpdateAtUtc,

                IsWindowsActivated =
                    request.IsWindowsActivated,

                InstalledSoftwareJson =
                    NormalizeJson(
                        request.InstalledSoftwareJson),

                NetworkConfigurationJson =
                    NormalizeJson(
                        request.NetworkConfigurationJson),

                HealthScore = 100,

                Status = DeviceStatus.Good,

                IssuesJson = "[]"
            };

            // =====================================================
            // 1. Existing hardcoded production rules
            // =====================================================

            IReadOnlyList<RuleResult> hardcodedResults =
                _ruleEngineService.Evaluate(
                    healthCheck);

            // =====================================================
            // 2. Dynamic Active monitoring rules
            // =====================================================

            IReadOnlyList<RuleResult> activeRuleResults =
                await _activeRuleService.EvaluateAsync(
                    healthCheck,
                    cancellationToken);

            // =====================================================
            // 3. Combine both rule engines
            // =====================================================

            List<RuleResult> triggeredRules =
                hardcodedResults
                    .Concat(activeRuleResults)
                    .ToList();

            // =====================================================
            // 4. Calculate Health Score
            // =====================================================

            int totalPenalty =
                triggeredRules.Sum(
                    result =>
                        result.ScorePenalty);

            int healthScore =
                Math.Clamp(
                    100 - totalPenalty,
                    0,
                    100);

            DeviceStatus status =
                DetermineStatus(
                    healthScore);

            List<string> issues =
                triggeredRules
                    .Select(
                        result =>
                            result.RuleCode)
                    .Distinct(
                        StringComparer.OrdinalIgnoreCase)
                    .ToList();

            healthCheck.HealthScore =
                healthScore;

            healthCheck.Status =
                status;

            healthCheck.IssuesJson =
                JsonSerializer.Serialize(
                    issues);

            _dbContext.HealthChecks.Add(
                healthCheck);

            // =====================================================
            // 5. Update Device
            // =====================================================

            device.TotalMemoryBytes =
                request.TotalMemoryBytes;

            device.HealthScore =
                healthScore;

            device.Status =
                status;

            device.LastSeenAtUtc =
                receivedAtUtc;

            // =====================================================
            // 6. Shadow evaluation
            // =====================================================

            await _shadowRuleService.EvaluateAsync(
                healthCheck,
                cancellationToken);

            // =====================================================
            // 7. Adaptive monitoring
            //
            // Determines how soon the agent should perform
            // the next health check based on proximity to
            // Active monitoring rule thresholds.
            // =====================================================

            AdaptiveMonitoringDecision monitoringDecision =
                await _adaptiveMonitoringService.EvaluateAsync(
                    healthCheck,
                    cancellationToken);

            // =====================================================
            // 8. Production ticket processing
            // =====================================================

            await _ticketService.ProcessRuleResultsAsync(
                healthCheck,
                triggeredRules,
                cancellationToken);

            return new SubmitHealthCheckResponse
            {
                HealthCheckId =
                    healthCheck.Id,

                HealthScore =
                    healthScore,

                Status =
                    status,

                ReceivedAtUtc =
                    receivedAtUtc,

                MonitoringLevel =
                    monitoringDecision.Level,

                RecommendedIntervalSeconds =
                    monitoringDecision
                        .RecommendedIntervalSeconds
            };
        }

        private static DeviceStatus DetermineStatus(
            int healthScore)
        {
            if (healthScore >= 80)
            {
                return DeviceStatus.Good;
            }

            if (healthScore >= 50)
            {
                return DeviceStatus.Warning;
            }

            return DeviceStatus.Critical;
        }

        private static string? NormalizeJson(
            string? json)
        {
            return string.IsNullOrWhiteSpace(json)
                ? null
                : json.Trim();
        }
    }
}