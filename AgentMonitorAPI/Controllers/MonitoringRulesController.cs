using System.Security.Claims;
using AgentMonitorAPI.Data;
using AgentMonitorAPI.DTOs.MonitoringRules;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using AgentMonitorAPI.Services.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/monitoring-rules")]
    [Authorize(
        AuthenticationSchemes = "DashboardJwt",
        Roles = "Administrator")]
    public sealed class MonitoringRulesController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly IAuditLogService _auditLogService;

        public MonitoringRulesController(
            AppDbContext dbContext,
            IAuditLogService auditLogService)
        {
            _dbContext = dbContext;
            _auditLogService = auditLogService;
        }

        // =========================================================
        // GET /api/monitoring-rules
        // =========================================================
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<MonitoringRuleResponse>>>
            GetAll(
                CancellationToken cancellationToken)
        {
            List<MonitoringRuleResponse> rules =
                await _dbContext.MonitoringRules
                    .AsNoTracking()
                    .OrderBy(x => x.Name)
                    .Select(x =>
                        new MonitoringRuleResponse
                        {
                            Id = x.Id,
                            Name = x.Name,
                            Description = x.Description,
                            Metric = x.Metric,
                            Operator = x.Operator,
                            Threshold = x.Threshold,
                            ConsecutiveChecks = x.ConsecutiveChecks,
                            Severity = x.Severity,
                            Mode = x.Mode,
                            CreatedAtUtc = x.CreatedAtUtc,
                            UpdatedAtUtc = x.UpdatedAtUtc
                        })
                    .ToListAsync(cancellationToken);

            return Ok(rules);
        }

        // =========================================================
        // POST /api/monitoring-rules
        // =========================================================
        [HttpPost]
        public async Task<ActionResult<MonitoringRuleResponse>> Create(
            CreateMonitoringRuleRequest request,
            CancellationToken cancellationToken)
        {
            DateTime nowUtc =
                DateTime.UtcNow;

            var rule = new MonitoringRule
            {
                Id =
                    Guid.NewGuid(),

                Name =
                    request.Name.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(request.Description)
                        ? null
                        : request.Description.Trim(),

                Metric =
                    request.Metric,

                Operator =
                    request.Operator,

                Threshold =
                    request.Threshold,

                ConsecutiveChecks =
                    request.ConsecutiveChecks,

                Severity =
                    request.Severity,

                Mode =
                    MonitoringRuleMode.Draft,

                CreatedAtUtc =
                    nowUtc,

                UpdatedAtUtc =
                    nowUtc
            };

            _dbContext.MonitoringRules.Add(rule);

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            UserAuditContext auditUser =
                GetAuditUser();

            await _auditLogService.WriteAsync(
                userId: auditUser.UserId,
                username: auditUser.Username,
                action: "RuleCreated",
                entityType: "MonitoringRule",
                entityId: rule.Id.ToString(),
                details:
                    $"Created monitoring rule '{rule.Name}'. " +
                    $"Metric: {rule.Metric}, " +
                    $"Operator: {rule.Operator}, " +
                    $"Threshold: {rule.Threshold:0.##}, " +
                    $"Consecutive checks: {rule.ConsecutiveChecks}, " +
                    $"Severity: {rule.Severity}.",
                cancellationToken);

            return Ok(
                ToResponse(rule));
        }

        // =========================================================
        // PUT /api/monitoring-rules/{id}/mode
        // =========================================================
        [HttpPut("{id:guid}/mode")]
        public async Task<ActionResult<MonitoringRuleResponse>>
            UpdateMode(
                Guid id,
                UpdateMonitoringRuleModeRequest request,
                CancellationToken cancellationToken)
        {
            MonitoringRule? rule =
                await _dbContext.MonitoringRules
                    .SingleOrDefaultAsync(
                        x => x.Id == id,
                        cancellationToken);

            if (rule is null)
            {
                return NotFound(new
                {
                    message =
                        "Monitoring rule was not found."
                });
            }

            if (rule.Mode == request.Mode)
            {
                return Ok(
                    ToResponse(rule));
            }

            MonitoringRuleMode previousMode =
                rule.Mode;

            // -----------------------------------------------------
            // ACTIVE
            // Rule must first pass Shadow validation.
            // -----------------------------------------------------
            if (request.Mode == MonitoringRuleMode.Active)
            {
                if (rule.Mode != MonitoringRuleMode.Shadow)
                {
                    return BadRequest(new
                    {
                        message =
                            "The rule must be validated in Shadow mode " +
                            "before it can be activated."
                    });
                }

                int minimumEvaluations =
                    Math.Max(
                        3,
                        rule.ConsecutiveChecks);

                int shadowEvaluations =
                    await _dbContext.ShadowRuleEvaluations
                        .CountAsync(
                            x =>
                                x.MonitoringRuleId == id,
                            cancellationToken);

                if (shadowEvaluations < minimumEvaluations)
                {
                    return BadRequest(new
                    {
                        message =
                            $"The rule requires at least " +
                            $"{minimumEvaluations} Shadow evaluations " +
                            $"before activation. Current evaluations: " +
                            $"{shadowEvaluations}."
                    });
                }
            }

            // -----------------------------------------------------
            // SHADOW
            // Start a new clean validation session.
            // -----------------------------------------------------
            if (request.Mode == MonitoringRuleMode.Shadow)
            {
                List<ShadowRuleEvaluation> oldEvaluations =
                    await _dbContext.ShadowRuleEvaluations
                        .Where(
                            x =>
                                x.MonitoringRuleId == id)
                        .ToListAsync(
                            cancellationToken);

                if (oldEvaluations.Count > 0)
                {
                    _dbContext.ShadowRuleEvaluations
                        .RemoveRange(
                            oldEvaluations);
                }
            }

            rule.Mode =
                request.Mode;

            rule.UpdatedAtUtc =
                DateTime.UtcNow;

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            UserAuditContext auditUser =
                GetAuditUser();

            string auditAction =
                request.Mode switch
                {
                    MonitoringRuleMode.Shadow =>
                        "ShadowStarted",

                    MonitoringRuleMode.Active =>
                        "RuleActivated",

                    MonitoringRuleMode.Disabled =>
                        "RuleDisabled",

                    _ =>
                        "RuleModeChanged"
                };

            await _auditLogService.WriteAsync(
                userId: auditUser.UserId,
                username: auditUser.Username,
                action: auditAction,
                entityType: "MonitoringRule",
                entityId: rule.Id.ToString(),
                details:
                    $"Monitoring rule '{rule.Name}' changed mode " +
                    $"from {previousMode} to {rule.Mode}.",
                cancellationToken);

            return Ok(
                ToResponse(rule));
        }

        // =========================================================
        // GET /api/monitoring-rules/{id}/shadow-summary
        // =========================================================
        [HttpGet("{id:guid}/shadow-summary")]
        public async Task<ActionResult<ShadowRuleSummaryResponse>>
            GetShadowSummary(
                Guid id,
                CancellationToken cancellationToken)
        {
            MonitoringRule? rule =
                await _dbContext.MonitoringRules
                    .AsNoTracking()
                    .SingleOrDefaultAsync(
                        x => x.Id == id,
                        cancellationToken);

            if (rule is null)
            {
                return NotFound(new
                {
                    message =
                        "Monitoring rule was not found."
                });
            }

            IQueryable<ShadowRuleEvaluation> query =
                _dbContext.ShadowRuleEvaluations
                    .AsNoTracking()
                    .Where(
                        x =>
                            x.MonitoringRuleId == id);

            int evaluations =
                await query.CountAsync(
                    cancellationToken);

            int conditionMetChecks =
                await query.CountAsync(
                    x => x.ConditionMet,
                    cancellationToken);

            int wouldTriggerIncidents =
                await query.CountAsync(
                    x => x.WouldTriggerIncident,
                    cancellationToken);

            int affectedDevices =
                await query
                    .Where(
                        x => x.ConditionMet)
                    .Select(
                        x => x.DeviceId)
                    .Distinct()
                    .CountAsync(
                        cancellationToken);

            DateTime? lastEvaluationAtUtc =
                await query
                    .OrderByDescending(
                        x => x.EvaluatedAtUtc)
                    .Select(
                        x => (DateTime?)x.EvaluatedAtUtc)
                    .FirstOrDefaultAsync(
                        cancellationToken);

            decimal conditionRatePercent =
                evaluations == 0
                    ? 0
                    : Math.Round(
                        conditionMetChecks * 100m /
                        evaluations,
                        2);

            return Ok(
                new ShadowRuleSummaryResponse
                {
                    MonitoringRuleId =
                        rule.Id,

                    RuleName =
                        rule.Name,

                    Evaluations =
                        evaluations,

                    ConditionMetChecks =
                        conditionMetChecks,

                    ConditionRatePercent =
                        conditionRatePercent,

                    WouldTriggerIncidents =
                        wouldTriggerIncidents,

                    AffectedDevices =
                        affectedDevices,

                    LastEvaluationAtUtc =
                        lastEvaluationAtUtc
                });
        }

        // =========================================================
        // PUT /api/monitoring-rules/{id}/apply-latest-recommendation
        // =========================================================
        [HttpPut("{id:guid}/apply-latest-recommendation")]
        public async Task<ActionResult<MonitoringRuleResponse>>
            ApplyLatestRecommendation(
                Guid id,
                CancellationToken cancellationToken)
        {
            MonitoringRule? rule =
                await _dbContext.MonitoringRules
                    .SingleOrDefaultAsync(
                        x => x.Id == id,
                        cancellationToken);

            if (rule is null)
            {
                return NotFound(new
                {
                    message =
                        "Monitoring rule was not found."
                });
            }

            // Active configuration must not be changed directly.
            if (rule.Mode == MonitoringRuleMode.Active)
            {
                return BadRequest(new
                {
                    message =
                        "Disable the active rule before applying " +
                        "a new recommendation."
                });
            }

            RuleSimulationRun? latestSimulation =
                await _dbContext.RuleSimulationRuns
                    .AsNoTracking()
                    .Where(
                        x =>
                            x.MonitoringRuleId == id)
                    .OrderByDescending(
                        x => x.CreatedAtUtc)
                    .FirstOrDefaultAsync(
                        cancellationToken);

            if (latestSimulation is null)
            {
                return BadRequest(new
                {
                    message =
                        "No saved simulation is available for this rule."
                });
            }

            if (!latestSimulation.RecommendedThreshold.HasValue)
            {
                return BadRequest(new
                {
                    message =
                        "The latest simulation does not contain " +
                        "a threshold recommendation."
                });
            }

            decimal previousThreshold =
                rule.Threshold;

            int previousConsecutiveChecks =
                rule.ConsecutiveChecks;

            decimal newThreshold =
                latestSimulation
                    .RecommendedThreshold
                    .Value;

            int newConsecutiveChecks =
                latestSimulation
                    .RecommendedConsecutiveChecks
                ?? rule.ConsecutiveChecks;

            // Nothing changed.
            if (previousThreshold == newThreshold &&
                previousConsecutiveChecks == newConsecutiveChecks)
            {
                return Ok(
                    ToResponse(rule));
            }

            rule.Threshold =
                newThreshold;

            rule.ConsecutiveChecks =
                newConsecutiveChecks;

            rule.UpdatedAtUtc =
                DateTime.UtcNow;

            // -----------------------------------------------------
            // Existing Shadow evaluations become invalid if
            // threshold or persistence changes.
            // -----------------------------------------------------
            if (rule.Mode == MonitoringRuleMode.Shadow)
            {
                List<ShadowRuleEvaluation> previousEvaluations =
                    await _dbContext.ShadowRuleEvaluations
                        .Where(
                            x =>
                                x.MonitoringRuleId == id)
                        .ToListAsync(
                            cancellationToken);

                if (previousEvaluations.Count > 0)
                {
                    _dbContext.ShadowRuleEvaluations
                        .RemoveRange(
                            previousEvaluations);
                }
            }

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            UserAuditContext auditUser =
                GetAuditUser();

            await _auditLogService.WriteAsync(
                userId: auditUser.UserId,
                username: auditUser.Username,
                action: "RuleRecommendationApplied",
                entityType: "MonitoringRule",
                entityId: rule.Id.ToString(),
                details:
                    $"Applied recommendation from simulation " +
                    $"{latestSimulation.Id} to monitoring rule " +
                    $"'{rule.Name}'. " +
                    $"Threshold: {previousThreshold:0.##} -> " +
                    $"{rule.Threshold:0.##}. " +
                    $"Consecutive checks: " +
                    $"{previousConsecutiveChecks} -> " +
                    $"{rule.ConsecutiveChecks}.",
                cancellationToken);

            return Ok(
                ToResponse(rule));
        }

        // =========================================================
        // GET /api/monitoring-rules/{id}/simulation-history
        // =========================================================
        [HttpGet("{id:guid}/simulation-history")]
        public async Task<ActionResult<
            IReadOnlyList<RuleSimulationHistoryResponse>>>
            GetSimulationHistory(
                Guid id,
                CancellationToken cancellationToken)
        {
            bool ruleExists =
                await _dbContext.MonitoringRules
                    .AsNoTracking()
                    .AnyAsync(
                        x => x.Id == id,
                        cancellationToken);

            if (!ruleExists)
            {
                return NotFound(new
                {
                    message =
                        "Monitoring rule was not found."
                });
            }

            List<RuleSimulationHistoryResponse> history =
                await _dbContext.RuleSimulationRuns
                    .AsNoTracking()
                    .Where(
                        x =>
                            x.MonitoringRuleId == id)
                    .OrderByDescending(
                        x => x.CreatedAtUtc)
                    .Select(x =>
                        new RuleSimulationHistoryResponse
                        {
                            Id =
                                x.Id,

                            MonitoringRuleId =
                                x.MonitoringRuleId,

                            FromUtc =
                                x.FromUtc,

                            ToUtc =
                                x.ToUtc,

                            Threshold =
                                x.Threshold,

                            ConsecutiveChecks =
                                x.ConsecutiveChecks,

                            HealthChecksAnalyzed =
                                x.HealthChecksAnalyzed,

                            TriggeredChecks =
                                x.TriggeredChecks,

                            TriggerRatePercent =
                                x.TriggerRatePercent,

                            TriggerRuns =
                                x.TriggerRuns,

                            AffectedDevices =
                                x.AffectedDevices,

                            EstimatedIncidents =
                                x.EstimatedIncidents,

                            TransientIncidents =
                                x.TransientIncidents,

                            TransientRatePercent =
                                x.TransientRatePercent,

                            RuleQuality =
                                x.RuleQuality,

                            NoiseLevel =
                                x.NoiseLevel,

                            EvaluationConfidence =
                                x.EvaluationConfidence,

                            RecommendedThreshold =
                                x.RecommendedThreshold,

                            RecommendedConsecutiveChecks =
                                x.RecommendedConsecutiveChecks,

                            CreatedAtUtc =
                                x.CreatedAtUtc
                        })
                    .ToListAsync(
                        cancellationToken);

            return Ok(history);
        }

        // =========================================================
        // DELETE /api/monitoring-rules/{id}
        // =========================================================
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(
            Guid id,
            CancellationToken cancellationToken)
        {
            MonitoringRule? rule =
                await _dbContext.MonitoringRules
                    .SingleOrDefaultAsync(
                        x => x.Id == id,
                        cancellationToken);

            if (rule is null)
            {
                return NotFound(new
                {
                    message =
                        "Monitoring rule was not found."
                });
            }

            if (rule.Mode != MonitoringRuleMode.Draft &&
                rule.Mode != MonitoringRuleMode.Disabled)
            {
                return BadRequest(new
                {
                    message =
                        "Only Draft or Disabled monitoring rules " +
                        "can be deleted."
                });
            }

            Guid ruleId =
                rule.Id;

            string ruleName =
                rule.Name;

            MonitoringRuleMode ruleMode =
                rule.Mode;

            List<ShadowRuleEvaluation> shadowEvaluations =
                await _dbContext.ShadowRuleEvaluations
                    .Where(
                        x =>
                            x.MonitoringRuleId == id)
                    .ToListAsync(
                        cancellationToken);

            if (shadowEvaluations.Count > 0)
            {
                _dbContext.ShadowRuleEvaluations
                    .RemoveRange(
                        shadowEvaluations);
            }

            List<RuleSimulationRun> simulationRuns =
                await _dbContext.RuleSimulationRuns
                    .Where(
                        x =>
                            x.MonitoringRuleId == id)
                    .ToListAsync(
                        cancellationToken);

            if (simulationRuns.Count > 0)
            {
                _dbContext.RuleSimulationRuns
                    .RemoveRange(
                        simulationRuns);
            }

            _dbContext.MonitoringRules.Remove(
                rule);

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            UserAuditContext auditUser =
                GetAuditUser();

            await _auditLogService.WriteAsync(
                userId: auditUser.UserId,
                username: auditUser.Username,
                action: "RuleDeleted",
                entityType: "MonitoringRule",
                entityId: ruleId.ToString(),
                details:
                    $"Deleted monitoring rule '{ruleName}'. " +
                    $"Previous mode: {ruleMode}.",
                cancellationToken);

            return NoContent();
        }

        // =========================================================
        // CURRENT DASHBOARD USER
        // =========================================================
        private UserAuditContext GetAuditUser()
        {
            string? userIdClaim =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            Guid? userId =
                Guid.TryParse(
                    userIdClaim,
                    out Guid parsedUserId)
                    ? parsedUserId
                    : null;

            string username =
                User.Identity?.Name
                ?? User.FindFirstValue(
                    ClaimTypes.Name)
                ?? "Unknown";

            return new UserAuditContext(
                userId,
                username);
        }

        // =========================================================
        // RESPONSE MAPPING
        // =========================================================
        private static MonitoringRuleResponse ToResponse(
            MonitoringRule rule)
        {
            return new MonitoringRuleResponse
            {
                Id =
                    rule.Id,

                Name =
                    rule.Name,

                Description =
                    rule.Description,

                Metric =
                    rule.Metric,

                Operator =
                    rule.Operator,

                Threshold =
                    rule.Threshold,

                ConsecutiveChecks =
                    rule.ConsecutiveChecks,

                Severity =
                    rule.Severity,

                Mode =
                    rule.Mode,

                CreatedAtUtc =
                    rule.CreatedAtUtc,

                UpdatedAtUtc =
                    rule.UpdatedAtUtc
            };
        }

        private sealed record UserAuditContext(
            Guid? UserId,
            string Username);
    }
}