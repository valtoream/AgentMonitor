using AgentMonitorAPI.DTOs.RuleSimulation;
using AgentMonitorAPI.Services.RuleSimulation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/rule-simulation")]
    [Authorize(
        AuthenticationSchemes = "DashboardJwt",
        Roles = "Administrator")]
    public sealed class RuleSimulationController
        : ControllerBase
    {
        private readonly IRuleSimulationService
            _ruleSimulationService;

        public RuleSimulationController(
            IRuleSimulationService ruleSimulationService)
        {
            _ruleSimulationService =
                ruleSimulationService;
        }

        [HttpPost("simulate")]
        public async Task<ActionResult<RuleSimulationResponse>> Simulate(
            [FromBody] SimulateRuleRequest request,
            CancellationToken cancellationToken)
        {
            if (request.FromUtc.HasValue &&
                request.ToUtc.HasValue &&
                request.FromUtc.Value >
                request.ToUtc.Value)
            {
                return BadRequest(
                    "FromUtc cannot be later than ToUtc.");
            }

            RuleSimulationResponse result =
                await _ruleSimulationService
                    .SimulateAsync(
                        request,
                        cancellationToken);

            return Ok(result);
        }
    }
}