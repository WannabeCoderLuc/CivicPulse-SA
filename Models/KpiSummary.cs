namespace CivicPulse_SA.Models;

public class KpiSummary
{
    public int TotalReports { get; set; }
    public int Resolved { get; set; }
    public int Pending { get; set; }
    public int InProgress { get; set; }
    public int Urgent { get; set; }

    
    public double ResolutionRate =>
        TotalReports == 0 ? 0 : Math.Round((double)Resolved / TotalReports * 100, 1);
}
