using System.Text.Json;
using AgentMonitor.Agent.Models;

namespace AgentMonitor.Agent.Services.Storage
{
    public sealed class AgentStateStore : IAgentStateStore
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            WriteIndented = true
        };

        private readonly string _registrationFilePath;
        private readonly ILogger<AgentStateStore> _logger;

        public AgentStateStore(
            ILogger<AgentStateStore> logger)
        {
            _logger = logger;

            string applicationDataPath =
                Environment.GetFolderPath(
                    Environment.SpecialFolder.CommonApplicationData);

            string agentDirectory = Path.Combine(
                applicationDataPath,
                "AgentMonitor");

            _registrationFilePath = Path.Combine(
                agentDirectory,
                "agent.json");
        }

        public bool Exists()
        {
            return File.Exists(_registrationFilePath);
        }

        public async Task<AgentRegistrationState?> LoadAsync()
        {
            if (!Exists())
            {
                return null;
            }

            try
            {
                string json = await File.ReadAllTextAsync(
                    _registrationFilePath);

                return JsonSerializer.Deserialize<AgentRegistrationState>(
                    json,
                    JsonOptions);
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "The agent registration state could not be loaded from {RegistrationFilePath}.",
                    _registrationFilePath);

                return null;
            }
        }

        public async Task SaveAsync(
            AgentRegistrationState state)
        {
            string? directoryPath =
                Path.GetDirectoryName(_registrationFilePath);

            if (string.IsNullOrWhiteSpace(directoryPath))
            {
                throw new InvalidOperationException(
                    "The registration directory path is invalid.");
            }

            Directory.CreateDirectory(directoryPath);

            string json = JsonSerializer.Serialize(
                state,
                JsonOptions);

            await File.WriteAllTextAsync(
                _registrationFilePath,
                json);

            _logger.LogInformation(
                "Agent registration state saved to {RegistrationFilePath}.",
                _registrationFilePath);
        }

        public Task DeleteAsync()
        {
            if (!File.Exists(_registrationFilePath))
            {
                return Task.CompletedTask;
            }

            File.Delete(_registrationFilePath);

            _logger.LogWarning(
                "Agent registration state deleted from {RegistrationFilePath}.",
                _registrationFilePath);

            return Task.CompletedTask;
        }
    }
}