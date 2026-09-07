using System.Security.Cryptography;
using System.Text;

namespace AgentMonitorAPI.Security
{
    public sealed class ApiKeyService : IApiKeyService
    {
        private const int SecretSizeInBytes = 32;

        public GeneratedApiKey Generate(Guid agentId)
        {
            byte[] secretBytes = RandomNumberGenerator.GetBytes(
                SecretSizeInBytes);

            string secret = ConvertToBase64Url(secretBytes);
            string fullKey = $"{agentId:N}.{secret}";
            string hash = HashSecret(secret);

            return new GeneratedApiKey(fullKey, hash);
        }

        public bool Verify(string secret, string storedHash)
        {
            if (string.IsNullOrWhiteSpace(secret) ||
                string.IsNullOrWhiteSpace(storedHash))
            {
                return false;
            }

            byte[] computedHash = SHA256.HashData(
                Encoding.UTF8.GetBytes(secret));

            byte[] expectedHash;

            try
            {
                expectedHash = Convert.FromBase64String(storedHash);
            }
            catch (FormatException)
            {
                return false;
            }

            return computedHash.Length == expectedHash.Length &&
                   CryptographicOperations.FixedTimeEquals(
                       computedHash,
                       expectedHash);
        }

        private static string HashSecret(string secret)
        {
            byte[] hashBytes = SHA256.HashData(
                Encoding.UTF8.GetBytes(secret));

            return Convert.ToBase64String(hashBytes);
        }

        private static string ConvertToBase64Url(byte[] bytes)
        {
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }
    }
}