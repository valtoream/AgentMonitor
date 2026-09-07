using AgentMonitorAPI.Models;

namespace AgentMonitorAPI.Services.Authentication
{
    public interface IJwtTokenService
    {
        string CreateToken(
            DashboardUser user,
            DateTime expiresAtUtc);
    }
}