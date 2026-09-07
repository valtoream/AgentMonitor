namespace AgentMonitor.Shared.DTOs.Tickets
{
    public sealed class TicketCountsResponse
    {
        public int Open { get; set; }

        public int Resolved { get; set; }

        public int All { get; set; }
    }
}