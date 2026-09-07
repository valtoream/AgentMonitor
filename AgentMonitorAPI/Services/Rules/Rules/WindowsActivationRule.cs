using AgentMonitor.Shared.Enums;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Services.Rules.Rules
{
    public sealed class WindowsActivationRule : IRule
    {
        public RuleResult Evaluate(HealthCheck healthCheck)
        {
            if (healthCheck.IsWindowsActivated != false)
            {
                return RuleResult.NotTriggered;
            }

            return new RuleResult
            {
                IsTriggered = true,
                RuleCode = "WINDOWS_NOT_ACTIVATED",
                Title = "Windows is not activated",
                Description =
                    "The operating system is not activated.",
                Severity = TicketSeverity.High,
                ScorePenalty = 15
            };
        }
    }
}