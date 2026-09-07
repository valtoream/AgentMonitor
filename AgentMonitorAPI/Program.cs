using AgentMonitorAPI.Data;
using AgentMonitorAPI.Data.Seed;
using AgentMonitorAPI.DTOs.MonitoringRules;
using AgentMonitorAPI.Security;
using AgentMonitorAPI.Security.Authentication;
using AgentMonitorAPI.Services.ActiveRules;
using AgentMonitorAPI.Services.AdaptiveMonitoring;
using AgentMonitorAPI.Services.Agents;
using AgentMonitorAPI.Services.Audit;
using AgentMonitorAPI.Services.Authentication;
using AgentMonitorAPI.Services.HealthChecks;
using AgentMonitorAPI.Services.Rules;
using AgentMonitorAPI.Services.Rules.Rules;
using AgentMonitorAPI.Services.RuleSimulation;
using AgentMonitorAPI.Services.ShadowRules;
using AgentMonitorAPI.Services.Tickets;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using System.Text;

namespace AgentMonitorAPI
{
    public class Program
    {
        private const string DashboardJwtScheme =
            "DashboardJwt";

        public static async Task Main(string[] args)
        {
            var builder =
                WebApplication.CreateBuilder(args);

            // Controllers
            builder.Services.AddControllers();

            // Database
            string connectionString =
                builder.Configuration
                    .GetConnectionString(
                        "DefaultConnection")
                ?? throw new InvalidOperationException(
                    "Connection string 'DefaultConnection' was not found.");

            builder.Services.AddDbContext<AppDbContext>(
                options =>
                    options.UseMySql(
                        connectionString,
                        new MySqlServerVersion(
                            new Version(8, 0, 0)),
                        mysqlOptions =>
                        {
                            mysqlOptions.EnableRetryOnFailure();
                        }));

            // Application services
            builder.Services.AddSingleton<
                IApiKeyService,
                ApiKeyService>();

            builder.Services.AddSingleton<
                IPasswordService,
                PasswordService>();

            builder.Services.AddSingleton<
                IJwtTokenService,
                JwtTokenService>();

            builder.Services.AddScoped<
                IAgentRegistrationService,
                AgentRegistrationService>();

            builder.Services.AddScoped<
                IActiveRuleService,
                ActiveRuleService>();

            builder.Services.AddScoped<
                IHealthCheckService,
                HealthCheckService>();

            builder.Services.AddScoped<
                IRuleEngineService,
                RuleEngineService>();

            builder.Services.AddScoped<
                ITicketService,
                TicketService>();

            builder.Services.AddScoped<
                ITicketQueryService,
                TicketQueryService>();

            builder.Services.AddScoped<
                IShadowRuleService,
                ShadowRuleService>();

            builder.Services.AddScoped<
                IRuleSimulationService,
                RuleSimulationService>();

            builder.Services.AddScoped<
                IAdaptiveMonitoringService,
                AdaptiveMonitoringService>();

            builder.Services.AddScoped<
                IAuditLogService,
                AuditLogService>();

            // Rules
            builder.Services.AddScoped<
                IRule,
                DiskUsageRule>();

            builder.Services.AddScoped<
                IRule,
                AntivirusRule>();

            builder.Services.AddScoped<
                IRule,
                PendingUpdatesRule>();

            builder.Services.AddScoped<
                IRule,
                MemoryRule>();

            // JWT configuration
            string jwtIssuer =
                builder.Configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException(
                    "JWT issuer is not configured.");

            string jwtAudience =
                builder.Configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException(
                    "JWT audience is not configured.");

            string jwtKey =
                builder.Configuration["Jwt:Key"]
                ?? throw new InvalidOperationException(
                    "JWT key is not configured.");

            // Authentication
            builder.Services
                .AddAuthentication(
                    ApiKeyAuthenticationDefaults.SchemeName)

                // Windows Agent authentication
                .AddScheme<
                    AuthenticationSchemeOptions,
                    ApiKeyAuthenticationHandler>(
                        ApiKeyAuthenticationDefaults.SchemeName,
                        options => { })

                // Dashboard JWT authentication
                .AddJwtBearer(
                    DashboardJwtScheme,
                    options =>
                    {
                        options.TokenValidationParameters =
                            new TokenValidationParameters
                            {
                                ValidateIssuer = true,
                                ValidIssuer = jwtIssuer,

                                ValidateAudience = true,
                                ValidAudience = jwtAudience,

                                ValidateIssuerSigningKey = true,
                                IssuerSigningKey =
                                    new SymmetricSecurityKey(
                                        Encoding.UTF8.GetBytes(
                                            jwtKey)),

                                ValidateLifetime = true,

                                ClockSkew =
                                    TimeSpan.FromMinutes(1)
                            };
                    });

            builder.Services.AddAuthorization();

            // Swagger / OpenAPI
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(options =>
            {
                // Agent API Key
                options.AddSecurityDefinition(
                    "AgentApiKey",
                    new OpenApiSecurityScheme
                    {
                        Name = "Authorization",
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "API Key",
                        In = ParameterLocation.Header,
                        Description =
                            "API key used by AgentMonitor.Agent."
                    });

                // Dashboard JWT
                options.AddSecurityDefinition(
                    "DashboardJwt",
                    new OpenApiSecurityScheme
                    {
                        Name = "Authorization",
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header,
                        Description =
                            "JWT returned by POST /api/auth/login."
                    });

                // Enable Dashboard JWT authorization in Swagger
                options.AddSecurityRequirement(
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference =
                                    new OpenApiReference
                                    {
                                        Type =
                                            ReferenceType.SecurityScheme,

                                        Id =
                                            "DashboardJwt"
                                    }
                            },
                            Array.Empty<string>()
                        }
                    });
            });

            var app =
                builder.Build();

            // Apply database migrations
            using (IServiceScope scope =
                   app.Services.CreateScope())
            {
                AppDbContext dbContext =
                    scope.ServiceProvider
                        .GetRequiredService<AppDbContext>();

                await dbContext.Database.MigrateAsync();
            }

            // Initial dashboard administrator
            await DashboardUserSeeder.SeedAsync(
                app.Services);

            // HTTP request pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}