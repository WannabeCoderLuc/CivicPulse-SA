using System.ComponentModel.DataAnnotations;

namespace CivicPulse_SA.Models;

public class CategoryCount
{
    [Required]
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
}
