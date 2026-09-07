using System.Security.Claims;
using System.Text.Encodings.Web;
using AgentMonitorAPI.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AgentMonitorAPI.Security.Authentication
{
    public sealed class ApiKeyAuthenticationHandler
        : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private readonly AppDbContext _dbContext;
        private readonly IApiKeyService _apiKeyService;

        public ApiKeyAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            AppDbContext dbContext,
            IApiKeyService apiKeyService)
            : base(options, logger, encoder)
        {
            _dbContext = dbContext;
            _apiKeyService = apiKeyService;
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            string authorizationHeader = Request.Headers.Authorization
                .ToString();

            if (string.IsNullOrWhiteSpace(authorizationHeader))
            {
                return AuthenticateResult.NoResult();
            }

            const string bearerPrefix = "Bearer ";

            if (!authorizationHeader.StartsWith(
                    bearerPrefix,
                    StringComparison.OrdinalIgnoreCase))
            {
                return AuthenticateResult.Fail(
                    "The Authorization header must use the Bearer scheme.");
            }

            string fullApiKey = authorizationHeader[bearerPrefix.Length..]
                .Trim();

            string[] keyParts = fullApiKey.Split(
                '.',
                count: 2,
                StringSplitOptions.RemoveEmptyEntries);

            if (keyParts.Length != 2 ||
                !Guid.TryParseExact(keyParts[0], "N", out Guid agentId))
            {
                return AuthenticateResult.Fail(
                    "The API key format is invalid.");
            }

            string secret = keyParts[1];

            var agent = await _dbContext.Agents
                .AsNoTracking()
                .Where(agent => agent.Id == agentId && agent.IsActive)
                .Select(agent => new
                {
                    agent.Id,
                    agent.DeviceId,
                    agent.ApiKeyHash
                })
                .SingleOrDefaultAsync(Context.RequestAborted);

            if (agent is null)
            {
                return AuthenticateResult.Fail(
                    "The agent does not exist or is inactive.");
            }

            bool isValid = _apiKeyService.Verify(
                secret,
                agent.ApiKeyHash);

            if (!isValid)
            {
                return AuthenticateResult.Fail(
                    "The API key is invalid.");
            }

            var claims = new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    agent.Id.ToString()),

                new Claim(
                    "device_id",
                    agent.DeviceId.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    $"Agent-{agent.Id}")
            };

            var identity = new ClaimsIdentity(
                claims,
                ApiKeyAuthenticationDefaults.SchemeName);

            var principal = new ClaimsPrincipal(identity);

            var ticket = new AuthenticationTicket(
                principal,
                ApiKeyAuthenticationDefaults.SchemeName);

            return AuthenticateResult.Success(ticket);
        }
    }
}