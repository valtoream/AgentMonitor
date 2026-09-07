using AgentMonitor.Shared.DTOs.Agents;
using AgentMonitorAPI.Services.Agents;
using Microsoft.AspNetCore.Mvc;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/agents")]
    public class AgentsController : ControllerBase
    {
        private readonly IAgentRegistrationService _registrationService;

        public AgentsController(
            IAgentRegistrationService registrationService)
        {
            _registrationService = registrationService;
        }

        [HttpPost("register")]
        [ProducesResponseType(
            typeof(RegisterAgentResponse),
            StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<RegisterAgentResponse>> Register(
            RegisterAgentRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                RegisterAgentResponse response =
                    await _registrationService.RegisterAsync(
                        request,
                        cancellationToken);

                return StatusCode(
                    StatusCodes.Status201Created,
                    response);
            }
            catch (InvalidOperationException exception)
            {
                return Conflict(new
                {
                    message = exception.Message
                });
            }
        }
    }
}