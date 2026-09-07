using AgentMonitorAPI.Models;

namespace AgentMonitorAPI.Services.Rules
{
    public sealed class RuleEngineService
        : IRuleEngineService
    {
        private readonly IEnumerable<IRule> _rules;

        public RuleEngineService(
            IEnumerable<IRule> rules)
        {
            _rules = rules;
        }

        public IReadOnlyList<RuleResult> Evaluate(
            HealthCheck healthCheck)
        {
            List<RuleResult> results = new();

            foreach (IRule rule in _rules)
            {
                RuleResult result =
                    rule.Evaluate(
                        healthCheck);

                if (result.IsTriggered)
                {
                    results.Add(result);
                }
            }

            return results;
        }
    }
}