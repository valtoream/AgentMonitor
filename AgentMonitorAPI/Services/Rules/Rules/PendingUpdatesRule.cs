using AgentMonitor.Shared.Enums;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Services.Rules.Rules
{
    public sealed class PendingUpdatesRule : IRule
    {
        public RuleResult Evaluate(HealthCheck healthCheck)
        {
            if (healthCheck.PendingUpdatesCount <= 0)
            {
                return RuleResult.NotTriggered;
            }

            if (healthCheck.PendingUpdatesCount >= 10)
            {
                return new RuleResult
                {
                    IsTriggered = true,
                    RuleCode = "WINDOWS_UPDATES_CRITICAL",
                    Title = "Many Windows updates are pending",
                    Description =
                        $"{healthCheck.PendingUpdatesCount} Windows updates are waiting to be installed.",
                    Severity = TicketSeverity.Critical,
                    ScorePenalty = 20
                };
            }

            return new RuleResult
            {
                IsTriggered = true,
                RuleCode = "WINDOWS_UPDATES_PENDING",
                Title = "Windows updates are pending",
                Description =
                    $"{healthCheck.PendingUpdatesCount} Windows updates are waiting to be installed.",
                Severity = TicketSeverity.High,
                ScorePenalty = 10
            };
        }
    }
}