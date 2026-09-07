using System.Security.Claims;
using AgentMonitor.Shared.DTOs.HealthChecks;
using AgentMonitorAPI.Services.HealthChecks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/healthchecks")]
    [Authorize]
    public class HealthChecksController : ControllerBase
    {
        private readonly IHealthCheckService _healthCheckService;

        public HealthChecksController(
            IHealthCheckService healthCheckService)
        {
            _healthCheckService = healthCheckService;
        }

        [HttpPost]
        [ProducesResponseType(
            typeof(SubmitHealthCheckResponse),
            StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<SubmitHealthCheckResponse>> Submit(
            [FromBody] SubmitHealthCheckRequest request,
            CancellationToken cancellationToken)
        {
            string? deviceIdClaim = User.FindFirstValue("device_id");

            if (!Guid.TryParse(deviceIdClaim, out Guid deviceId))
            {
                return Unauthorized(new
                {
                    message = "The authenticated agent does not contain a valid device identifier."
                });
            }

            SubmitHealthCheckResponse response =
                await _healthCheckService.SubmitAsync(
                    deviceId,
                    request,
                    cancellationToken);

            return Ok(response);
        }
    }
}