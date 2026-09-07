using AgentMonitor.Shared.DTOs.Authentication;
using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Services.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgentMonitorAPI.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using AgentMonitorAPI.Services.Audit;

namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public sealed class AuthController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly IPasswordService _passwordService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IAuditLogService _auditLogService;
        public AuthController(
    AppDbContext dbContext,
    IPasswordService passwordService,
    IJwtTokenService jwtTokenService,
    IAuditLogService auditLogService)
        {
            _dbContext = dbContext;
            _passwordService = passwordService;
            _jwtTokenService = jwtTokenService;
            _auditLogService = auditLogService;
        }

        [HttpPost("login")]
        [ProducesResponseType(
            typeof(LoginResponse),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResponse>> LoginAsync(
            LoginRequest request,
            CancellationToken cancellationToken)
        {
            string username =
                request.Username.Trim();

            DashboardUser? user =
                await _dbContext.DashboardUsers
                    .SingleOrDefaultAsync(
                        user => user.Username == username,
                        cancellationToken);

            if (user is null || !user.IsActive)
            {
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            bool passwordIsValid =
                _passwordService.VerifyPassword(
                    user,
                    request.Password,
                    user.PasswordHash);

            if (!passwordIsValid)
            {
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            DateTime nowUtc =
                DateTime.UtcNow;

            DateTime expiresAtUtc =
                nowUtc.AddHours(8);

            string accessToken =
                _jwtTokenService.CreateToken(
                    user,
                    expiresAtUtc);

            user.LastLoginAtUtc =
                nowUtc;

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            await _auditLogService.WriteAsync(
                user.Id,
                user.Username,
                "Login",
                "DashboardUser",
                user.Id.ToString(),
                $"User logged in with role {user.Role}.",
                cancellationToken);

            return Ok(
                new LoginResponse
                {
                    AccessToken = accessToken,
                    ExpiresAtUtc = expiresAtUtc,
                    Username = user.Username,
                    Role = user.Role.ToString()
                });
        }
        [HttpGet("me")]
        [Authorize(AuthenticationSchemes = "DashboardJwt")]
        [ProducesResponseType(
    StatusCodes.Status200OK)]
        [ProducesResponseType(
    StatusCodes.Status401Unauthorized)]
        public ActionResult GetCurrentUser()
        {
            string? userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            string? username =
                User.FindFirstValue(
                    ClaimTypes.Name);

            string? role =
                User.FindFirstValue(
                    ClaimTypes.Role);

            return Ok(new
            {
                Id = userId,
                Username = username,
                Role = role
            });
        }
    }
}