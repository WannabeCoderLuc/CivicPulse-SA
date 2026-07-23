using System.ComponentModel.DataAnnotations;

namespace CivicPulse_SA.Models;

public class TimelineEvent
{
    public int Id { get; set; }

    public int ReportId { get; set; }

    [Required]
    [StringLength(40)]
    public string Stage { get; set; } = string.Empty;

    [StringLength(500)]
    public string Note { get; set; } = string.Empty;

    [StringLength(80)]
    public string PerformedBy { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;


    public string ElapsedLabel
    {
        get
        {
            var diff = DateTime.UtcNow - Timestamp;
            if (diff.TotalMinutes < 1) return "Just now";
            if (diff.TotalHours < 1) return $"{(int)diff.TotalMinutes}m ago";
            if (diff.TotalDays < 1) return $"{(int)diff.TotalHours}h ago";
            return $"{(int)diff.TotalDays}d ago";
        }
    }
}
