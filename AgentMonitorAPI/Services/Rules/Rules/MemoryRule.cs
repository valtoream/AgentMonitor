using AgentMonitor.Shared.Enums;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Services.Rules.Rules
{
    public sealed class MemoryRule : IRule
    {
        private const long MinimumMemoryBytes =
            8L * 1024 * 1024 * 1024;

        public RuleResult Evaluate(HealthCheck healthCheck)
        {
            if (healthCheck.TotalMemoryBytes >= MinimumMemoryBytes)
            {
                return RuleResult.NotTriggered;
            }

            double totalMemoryGigabytes =
                healthCheck.TotalMemoryBytes /
                1024d /
                1024d /
                1024d;

            return new RuleResult
            {
                IsTriggered = true,
                RuleCode = "INSUFFICIENT_RAM",
                Title = "Insufficient system memory",
                Description =
                    $"The device has {totalMemoryGigabytes:F2} GB of RAM. " +
                    "The minimum recommended amount is 8 GB.",
                Severity = TicketSeverity.High,
                ScorePenalty = 10
            };
        }
    }
}