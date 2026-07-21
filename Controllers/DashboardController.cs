using Microsoft.AspNetCore.Mvc;
using CivicPulse_SA.Services;

namespace CivicPulse_SA.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DatabaseService _db;

    public DashboardController(DatabaseService db)
    {
        _db = db;
        Console.WriteLine("INIT: DashboardController instantiated");
    }

    [HttpGet("kpi")]
    public async Task<IActionResult> GetKpi()
    {
        Console.WriteLine("ENTER: GET /api/dashboard/kpi");
        try
        {
            var summary = await _db.GetKpiSummaryAsync();
            Console.WriteLine("SUCCESS: GET /api/dashboard/kpi returned summary");
            return Ok(summary);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-020: GET /api/dashboard/kpi failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-020", message = "Failed to retrieve KPI data." });
        }
    }

    [HttpGet("analytics/by-category")]
    public async Task<IActionResult> GetByCategory()
    {
        Console.WriteLine("ENTER: GET /api/dashboard/analytics/by-category");
        try
        {
            var data = await _db.GetReportsByCategoryAsync();
            Console.WriteLine("SUCCESS: GET /api/dashboard/analytics/by-category complete");
            return Ok(data);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-021: GetByCategory failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-021", message = "Failed to retrieve category analytics." });
        }
    }

    [HttpGet("analytics/ward-performance")]
    public async Task<IActionResult> GetWardPerformance()
    {
        Console.WriteLine("ENTER: GET /api/dashboard/analytics/ward-performance");
        try
        {
            var data = await _db.GetWardPerformanceAsync();
            Console.WriteLine("SUCCESS: GET /api/dashboard/analytics/ward-performance complete");
            return Ok(data);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-022: GetWardPerformance failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-022", message = "Failed to retrieve ward performance." });
        }
    }
}
