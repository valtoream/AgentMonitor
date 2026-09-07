namespace AgentMonitorAPI.DTOs.RuleSimulation
{
    public sealed class RuleSimulationDeviceResult
    {
        public Guid DeviceId { get; init; }

        public int AnalyzedHealthChecks { get; init; }

        public int SkippedHealthChecks { get; init; }

        public int TriggeredHealthChecks { get; init; }

        public int TriggerRuns { get; init; }

        public int PotentialIncidents { get; init; }

        public int TransientIncidents { get; init; }
    }
}