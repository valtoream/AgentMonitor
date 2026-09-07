using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Services.Rules.Rules
{
    public sealed class DiskUsageRule : IRule
    {
        public RuleResult Evaluate(
            HealthCheck healthCheck)
        {
            if (healthCheck.DiskUsagePercent >= 90)
            {
                return new RuleResult
                {
                    IsTriggered = true,
                    RuleCode = "DISK_USAGE_HIGH",
                    Title = "System drive usage is high",
                    Description =
                        $"System drive usage is {healthCheck.DiskUsagePercent:F2}% which exceeds the configured threshold.",
                    Severity = TicketSeverity.High,
                    ScorePenalty = 10
                };
            }

            if (healthCheck.DiskUsagePercent >= 80)
            {
                return new RuleResult
                {
                    IsTriggered = true,
                    RuleCode = "DISK_USAGE_HIGH",
                    Title = "System drive usage is high",
                    Description =
                        $"System drive usage is {healthCheck.DiskUsagePercent:F2}% which exceeds the warning threshold.",
                    Severity = TicketSeverity.High,
                    ScorePenalty = 10
                };
            }

            return new RuleResult
            {
                IsTriggered = false
            };
        }
    }
}