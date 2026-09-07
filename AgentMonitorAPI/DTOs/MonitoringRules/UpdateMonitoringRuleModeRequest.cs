using AgentMonitorAPI.Models.Enums;

namespace AgentMonitorAPI.DTOs.MonitoringRules
{
    public sealed class UpdateMonitoringRuleModeRequest
    {
        public MonitoringRuleMode Mode { get; set; }
    }
}