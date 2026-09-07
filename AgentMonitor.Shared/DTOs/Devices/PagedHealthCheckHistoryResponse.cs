namespace AgentMonitor.Shared.DTOs.Devices
{
    public sealed class PagedHealthCheckHistoryResponse
    {
        public IReadOnlyList<HealthCheckHistoryItemResponse> Items { get; set; }
            = Array.Empty<HealthCheckHistoryItemResponse>();

        public int Page { get; set; }

        public int PageSize { get; set; }

        public int TotalCount { get; set; }

        public int TotalPages { get; set; }
    }
}