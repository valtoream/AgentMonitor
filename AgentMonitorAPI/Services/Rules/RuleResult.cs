using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.Services.Rules
{
    public sealed class RuleResult
    {
        public bool IsTriggered { get; init; }

        public string RuleCode { get; init; } = string.Empty;

        public string Title { get; init; } = string.Empty;

        public string Description { get; init; } = string.Empty;

        public TicketSeverity Severity { get; init; }

        public int ScorePenalty { get; init; }

        public static RuleResult NotTriggered => new()
        {
            IsTriggered = false
        };
    }
}