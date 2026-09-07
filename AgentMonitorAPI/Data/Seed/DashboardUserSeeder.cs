using AgentMonitorAPI.Models;
using AgentMonitorAPI.Models.Enums;
using AgentMonitorAPI.Services.Authentication;
using Microsoft.EntityFrameworkCore;

namespace AgentMonitorAPI.Data.Seed
{
    public static class DashboardUserSeeder
    {
        public static async Task SeedAsync(
            IServiceProvider serviceProvider)
        {
            using IServiceScope scope =
                serviceProvider.CreateScope();

            AppDbContext dbContext =
                scope.ServiceProvider
                    .GetRequiredService<AppDbContext>();

            IPasswordService passwordService =
                scope.ServiceProvider
                    .GetRequiredService<IPasswordService>();

            IConfiguration configuration =
                scope.ServiceProvider
                    .GetRequiredService<IConfiguration>();

            string? username =
                configuration["InitialAdmin:Username"];

            if (string.IsNullOrWhiteSpace(username))
            {
                throw new InvalidOperationException(
                    "Initial administrator username is not configured.");
            }

            username = username.Trim();

            DashboardUser? existingAdministrator =
                await dbContext.DashboardUsers
                    .SingleOrDefaultAsync(user =>
                        user.Username == username);

            if (existingAdministrator is not null)
            {
                return;
            }

            string? password =
                configuration["InitialAdmin:Password"];

            if (string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException(
                    "Initial administrator password is not configured.");
            }

            var administrator =
                new DashboardUser
                {
                    Id = Guid.NewGuid(),
                    Username = username,
                    Role = UserRole.Administrator,
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow
                };

            administrator.PasswordHash =
                passwordService.HashPassword(
                    administrator,
                    password);

            dbContext.DashboardUsers.Add(
                administrator);

            await dbContext.SaveChangesAsync();
        }
    }
}