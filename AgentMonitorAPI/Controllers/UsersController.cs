using System.Security.Claims;
using AgentMonitor.Shared.DTOs.Users;
using AgentMonitorAPI.Data;
using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using AgentMonitorAPI.Services.Audit;
using AgentMonitorAPI.Services.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace AgentMonitorAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(
        AuthenticationSchemes = "DashboardJwt",
        Roles = "Administrator")]
    public sealed class UsersController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly IPasswordService _passwordService;
        private readonly IAuditLogService _auditLogService;

        public UsersController(
            AppDbContext dbContext,
            IPasswordService passwordService,
            IAuditLogService auditLogService)
        {
            _dbContext = dbContext;
            _passwordService = passwordService;
            _auditLogService = auditLogService;
        }

        // =========================================================
        // GET USERS
        // =========================================================

        [HttpGet]
        [ProducesResponseType(
            typeof(IReadOnlyList<UserResponse>),
            StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<UserResponse>>>
            GetUsersAsync(
                CancellationToken cancellationToken)
        {
            List<UserResponse> users =
                await _dbContext.DashboardUsers
                    .AsNoTracking()
                    .OrderBy(user => user.Username)
                    .Select(user => new UserResponse
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Role = user.Role.ToString(),
                        IsActive = user.IsActive,
                        CreatedAtUtc = user.CreatedAtUtc,
                        LastLoginAtUtc = user.LastLoginAtUtc
                    })
                    .ToListAsync(cancellationToken);

            return Ok(users);
        }

        // =========================================================
        // CREATE USER
        // =========================================================

        [HttpPost]
        [ProducesResponseType(
            typeof(UserResponse),
            StatusCodes.Status201Created)]
        [ProducesResponseType(
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserResponse>>
            CreateUserAsync(
                CreateUserRequest request,
                CancellationToken cancellationToken)
        {
            string username =
                request.Username.Trim();

            bool usernameExists =
                await _dbContext.DashboardUsers
                    .AnyAsync(
                        user =>
                            user.Username == username,
                        cancellationToken);

            if (usernameExists)
            {
                return Conflict(new
                {
                    message =
                        "A user with this username already exists."
                });
            }

            if (!Enum.TryParse<UserRole>(
                    request.Role,
                    ignoreCase: true,
                    out UserRole role))
            {
                return BadRequest(new
                {
                    message =
                        "Invalid user role."
                });
            }

            var user =
                new DashboardUser
                {
                    Id = Guid.NewGuid(),
                    Username = username,
                    Role = role,
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow
                };

            user.PasswordHash =
                _passwordService.HashPassword(
                    user,
                    request.Password);

            _dbContext.DashboardUsers.Add(user);

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            Guid? administratorId =
                GetCurrentUserId();

            string? administratorUsername =
                User.FindFirstValue(
                    ClaimTypes.Name);

            await _auditLogService.WriteAsync(
                administratorId,
                administratorUsername,
                "UserCreated",
                "DashboardUser",
                user.Id.ToString(),
                $"Created user {user.Username} with role {user.Role}.",
                cancellationToken);

            return StatusCode(
                StatusCodes.Status201Created,
                ToResponse(user));
        }

        // =========================================================
        // ENABLE / DISABLE USER
        // =========================================================

        [HttpPut("{userId:guid}/status")]
        [ProducesResponseType(
            typeof(UserResponse),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserResponse>>
            SetStatusAsync(
                Guid userId,
                [FromQuery] bool isActive,
                CancellationToken cancellationToken)
        {
            DashboardUser? user =
                await _dbContext.DashboardUsers
                    .SingleOrDefaultAsync(
                        item => item.Id == userId,
                        cancellationToken);

            if (user is null)
            {
                return NotFound(new
                {
                    message =
                        "User was not found."
                });
            }

            Guid? administratorId =
                GetCurrentUserId();

            // Не позволяваме администраторът
            // да disable-не собствения си акаунт.
            if (!isActive &&
                administratorId.HasValue &&
                administratorId.Value == userId)
            {
                return BadRequest(new
                {
                    message =
                        "You cannot disable your own account."
                });
            }

            // Не позволяваме да бъде изключен
            // последният активен Administrator.
            if (!isActive &&
                user.Role == UserRole.Administrator)
            {
                int activeAdministrators =
                    await _dbContext.DashboardUsers
                        .CountAsync(
                            item =>
                                item.Role ==
                                    UserRole.Administrator &&
                                item.IsActive,
                            cancellationToken);

                if (activeAdministrators <= 1)
                {
                    return BadRequest(new
                    {
                        message =
                            "The last active administrator cannot be disabled."
                    });
                }
            }

            user.IsActive =
                isActive;

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            string? administratorUsername =
                User.FindFirstValue(
                    ClaimTypes.Name);

            string action =
                isActive
                    ? "UserEnabled"
                    : "UserDisabled";

            await _auditLogService.WriteAsync(
                administratorId,
                administratorUsername,
                action,
                "DashboardUser",
                user.Id.ToString(),
                $"{action} user {user.Username}.",
                cancellationToken);

            return Ok(
                ToResponse(user));
        }

        // =========================================================
        // CHANGE PASSWORD
        // =========================================================

        [HttpPut("{userId:guid}/password")]
        [ProducesResponseType(
            StatusCodes.Status204NoContent)]
        [ProducesResponseType(
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            StatusCodes.Status404NotFound)]
        public async Task<IActionResult>
            ChangePasswordAsync(
                Guid userId,
                ChangeUserPasswordRequest request,
                CancellationToken cancellationToken)
        {
            DashboardUser? user =
                await _dbContext.DashboardUsers
                    .SingleOrDefaultAsync(
                        item => item.Id == userId,
                        cancellationToken);

            if (user is null)
            {
                return NotFound(new
                {
                    message =
                        "User was not found."
                });
            }

            if (string.IsNullOrWhiteSpace(
                    request.NewPassword) ||
                request.NewPassword.Length < 8)
            {
                return BadRequest(new
                {
                    message =
                        "Password must contain at least 8 characters."
                });
            }

            user.PasswordHash =
                _passwordService.HashPassword(
                    user,
                    request.NewPassword);

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            Guid? administratorId =
                GetCurrentUserId();

            string? administratorUsername =
                User.FindFirstValue(
                    ClaimTypes.Name);

            await _auditLogService.WriteAsync(
                administratorId,
                administratorUsername,
                "UserPasswordChanged",
                "DashboardUser",
                user.Id.ToString(),
                $"Password changed for user {user.Username}.",
                cancellationToken);

            return NoContent();
        }

        // =========================================================
        // DELETE USER
        // =========================================================

        [HttpDelete("{userId:guid}")]
        [ProducesResponseType(
            StatusCodes.Status204NoContent)]
        [ProducesResponseType(
            StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
            StatusCodes.Status404NotFound)]
        public async Task<IActionResult>
            DeleteUserAsync(
                Guid userId,
                CancellationToken cancellationToken)
        {
            DashboardUser? user =
                await _dbContext.DashboardUsers
                    .SingleOrDefaultAsync(
                        item => item.Id == userId,
                        cancellationToken);

            if (user is null)
            {
                return NotFound(new
                {
                    message =
                        "User was not found."
                });
            }

            Guid? administratorId =
                GetCurrentUserId();

            // Не позволяваме да изтрием
            // акаунта, с който сме логнати.
            if (administratorId.HasValue &&
                administratorId.Value == userId)
            {
                return BadRequest(new
                {
                    message =
                        "You cannot delete your own account."
                });
            }

            // Не позволяваме да изтрием
            // последния Administrator.
            if (user.Role ==
                UserRole.Administrator)
            {
                int administrators =
                    await _dbContext.DashboardUsers
                        .CountAsync(
                            item =>
                                item.Role ==
                                UserRole.Administrator,
                            cancellationToken);

                if (administrators <= 1)
                {
                    return BadRequest(new
                    {
                        message =
                            "The last administrator cannot be deleted."
                    });
                }
            }

            string deletedUsername =
                user.Username;

            string deletedUserId =
                user.Id.ToString();

            _dbContext.DashboardUsers.Remove(
                user);

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            string? administratorUsername =
                User.FindFirstValue(
                    ClaimTypes.Name);

            await _auditLogService.WriteAsync(
                administratorId,
                administratorUsername,
                "UserDeleted",
                "DashboardUser",
                deletedUserId,
                $"Deleted user {deletedUsername}.",
                cancellationToken);

            return NoContent();
        }

        // =========================================================
        // HELPERS
        // =========================================================

        private static UserResponse ToResponse(
            DashboardUser user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAtUtc = user.CreatedAtUtc,
                LastLoginAtUtc = user.LastLoginAtUtc
            };
        }

        private Guid? GetCurrentUserId()
        {
            string? userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (Guid.TryParse(
                    userId,
                    out Guid parsedUserId))
            {
                return parsedUserId;
            }

            return null;
        }
    }
}