namespace AgentMonitorAPI.Security
{
    public interface IApiKeyService
    {

        GeneratedApiKey Generate(Guid agentId);

        bool Verify(string secret, string storedHash);
    }

}