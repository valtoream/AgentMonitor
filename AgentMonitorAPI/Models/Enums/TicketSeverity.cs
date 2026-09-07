using System.Text.Json.Serialization;

namespace AgentMonitorAPI.Models.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TicketSeverity
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Critical = 3
    }
}