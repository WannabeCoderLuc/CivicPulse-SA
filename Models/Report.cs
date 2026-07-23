using System.ComponentModel.DataAnnotations;

namespace CivicPulse_SA.Models;

public class Report
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(120, MinimumLength = 5, ErrorMessage = "Title must be between 5 and 120 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(1000, MinimumLength = 10, ErrorMessage = "Description must be at least 10 characters.")]
    public string Description { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Water|Electricity|Roads|Waste|Sewer)$",
        ErrorMessage = "Category must be one of: Water, Electricity, Roads, Waste, Sewer.")]
    public string Category { get; set; } = string.Empty;

    public string Status { get; set; } = ValidStatuses.Reported;

    [Required(ErrorMessage = "Ward is required.")]
    [StringLength(30)]
    public string Ward { get; set; } = string.Empty;

    [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
    public double Latitude { get; set; }

    [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
    public double Longitude { get; set; }

    [Url(ErrorMessage = "ImageUrl must be a valid URL if provided.")]
    public string? ImageUrl { get; set; }

    [StringLength(80)]
    public string ReportedBy { get; set; } = "Anonymous Citizen";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool IsResolved => Status == ValidStatuses.Completed;

    // Urgent reports need a timeline entry regardless of stage order
    public bool RequiresImmediateAttention => Status == ValidStatuses.Urgent;
}

public static class ValidStatuses
{
    public const string Reported = "Reported";
    public const string Verified = "Verified";
    public const string Assigned = "Assigned";
    public const string RepairStarted = "Repair Started";
    public const string Completed = "Completed";
    public const string Urgent = "Urgent";
    public const string InProgress = "In Progress";

    private static readonly HashSet<string> _all = [
        Reported, Verified, Assigned, RepairStarted, Completed, Urgent, InProgress
    ];

    public static bool IsValid(string status) => _all.Contains(status);


    // not sequential, so they are intentionally absent from this ordered list.
    public static readonly string[] PipelineOrder =
        [Reported, Verified, Assigned, RepairStarted, Completed];
}
