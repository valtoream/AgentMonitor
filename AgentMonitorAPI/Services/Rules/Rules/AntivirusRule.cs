using AgentMonitor.Shared.Enums;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Services.Rules.Rules
{
    public sealed class AntivirusRule : IRule
    {
        public RuleResult Evaluate(HealthCheck healthCheck)
        {
            if (healthCheck.IsAntivirusInstalled == false)
            {
                return new RuleResult
                {
                    IsTriggered = true,
                    RuleCode = "ANTIVIRUS_NOT_INSTALLED",
                    Title = "Antivirus is not installed",
                    Description =
                        "No antivirus product was detected on the device.",
                    Severity = TicketSeverity.Critical,
                    ScorePenalty = 30
                };
            }

            if (healthCheck.IsAntivirusEnabled == false)
            {
                return new RuleResult
                {
                    IsTriggered = true,
                    RuleCode = "ANTIVIRUS_DISABLED",
                    Title = "Antivirus is disabled",
                    Description =
                        "The detected antivirus product is currently disabled.",
                    Severity = TicketSeverity.Critical,
                    ScorePenalty = 30
                };
            }

            if (healthCheck.IsAntivirusUpToDate == false)
            {
                return new RuleResult
                {
                    IsTriggered = true,
                    RuleCode = "ANTIVIRUS_OUTDATED",
                    Title = "Antivirus definitions are outdated",
                    Description =
                        "The antivirus product reports outdated security definitions.",
                    Severity = TicketSeverity.High,
                    ScorePenalty = 15
                };
            }

            return RuleResult.NotTriggered;
        }
    }
}