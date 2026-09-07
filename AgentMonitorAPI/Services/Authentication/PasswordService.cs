using AgentMonitorAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace AgentMonitorAPI.Services.Authentication
{
    public sealed class PasswordService
        : IPasswordService
    {
        private readonly PasswordHasher<DashboardUser>
            _passwordHasher = new();

        public string HashPassword(
            DashboardUser user,
            string password)
        {
            return _passwordHasher.HashPassword(
                user,
                password);
        }

        public bool VerifyPassword(
            DashboardUser user,
            string password,
            string passwordHash)
        {
            PasswordVerificationResult result =
                _passwordHasher.VerifyHashedPassword(
                    user,
                    passwordHash,
                    password);

            return result !=
                PasswordVerificationResult.Failed;
        }
    }
}