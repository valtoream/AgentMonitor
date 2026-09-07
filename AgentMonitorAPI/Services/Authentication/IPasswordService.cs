using AgentMonitorAPI.Models;

namespace AgentMonitorAPI.Services.Authentication
{
    public interface IPasswordService
    {
        string HashPassword(
            DashboardUser user,
            string password);

        bool VerifyPassword(
            DashboardUser user,
            string password,
            string passwordHash);
    }
}