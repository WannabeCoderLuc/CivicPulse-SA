namespace CivicPulse_SA.Models;

public class WardPerformance
{
    public string Ward { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Resolved { get; set; }


    public double ResolutionRate =>
        Total == 0 ? 0 : Math.Round((double)Resolved / Total * 100, 1);
}
