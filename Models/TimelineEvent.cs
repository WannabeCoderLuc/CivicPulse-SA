namespace CivicPulse_SA.Models;

public class TimelineEvent
{
    public int Id { get; set; }
    public int ReportId { get; set; }
    public string Stage { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
