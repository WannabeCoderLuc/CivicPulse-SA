using Microsoft.AspNetCore.Mvc;
using CivicPulse_SA.Models;
using CivicPulse_SA.Services;

namespace CivicPulse_SA.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly DatabaseService _db;

    public ReportsController(DatabaseService db)
    {
        _db = db;
        Console.WriteLine("INIT: ReportsController instantiated");
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, [FromQuery] string? status, [FromQuery] string? ward)
    {
        Console.WriteLine($"ENTER: GET /api/reports — category={category} status={status} ward={ward}");
        try
        {
            var reports = await _db.GetAllReportsAsync();

            if (!string.IsNullOrWhiteSpace(category))
                reports = reports.Where(r => r.Category.Equals(category, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(status))
                reports = reports.Where(r => r.Status.Equals(status, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(ward))
                reports = reports.Where(r => r.Ward.Equals(ward, StringComparison.OrdinalIgnoreCase));

            Console.WriteLine($"SUCCESS: GET /api/reports returned {reports.Count()} items");
            return Ok(reports);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-001: GET /api/reports failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-001", message = "Failed to retrieve reports." });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        Console.WriteLine($"ENTER: GET /api/reports/{id}");
        try
        {
            var report = await _db.GetReportByIdAsync(id);
            if (report == null)
            {
                Console.WriteLine($"INFO: Report {id} not found — 404");
                return NotFound(new { errorCode = "ERR-API-002", message = $"Report {id} not found." });
            }

            Console.WriteLine($"SUCCESS: GET /api/reports/{id} returned report");
            return Ok(report);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-003: GET /api/reports/{id} failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-003", message = "Failed to retrieve report." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Report report)
    {
        Console.WriteLine("ENTER: POST /api/reports — SubmitReport");
        try
        {
            if (!ModelState.IsValid)
            {
                Console.WriteLine("ERR-API-004: Invalid model state for POST /api/reports");
                return BadRequest(new { errorCode = "ERR-API-004", message = "Invalid report data.", errors = ModelState });
            }

            var id = await _db.CreateReportAsync(report);
            var created = await _db.GetReportByIdAsync(id);

            Console.WriteLine($"SUCCESS: POST /api/reports — new report created id={id}");
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-005: POST /api/reports failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-005", message = "Failed to create report." });
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateRequest request)
    {
        Console.WriteLine($"ENTER: PATCH /api/reports/{id}/status — newStatus={request.Status}");
        try
        {
            var validStatuses = new[] { "Reported", "Verified", "Assigned", "Repair Started", "Completed", "Urgent", "In Progress" };
            if (!validStatuses.Contains(request.Status))
            {
                Console.WriteLine($"ERR-API-006: Invalid status value '{request.Status}'");
                return BadRequest(new { errorCode = "ERR-API-006", message = $"Invalid status: {request.Status}" });
            }

            var updated = await _db.UpdateReportStatusAsync(id, request.Status);
            if (!updated)
            {
                Console.WriteLine($"INFO: PATCH status — report {id} not found");
                return NotFound(new { errorCode = "ERR-API-007", message = $"Report {id} not found." });
            }

            var report = await _db.GetReportByIdAsync(id);
            Console.WriteLine($"SUCCESS: PATCH /api/reports/{id}/status — updated to {request.Status}");
            return Ok(report);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-008: PATCH /api/reports/{id}/status failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-008", message = "Failed to update report status." });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        Console.WriteLine($"ENTER: DELETE /api/reports/{id}");
        try
        {
            var deleted = await _db.DeleteReportAsync(id);
            if (!deleted)
            {
                Console.WriteLine($"INFO: DELETE — report {id} not found");
                return NotFound(new { errorCode = "ERR-API-009", message = $"Report {id} not found." });
            }

            Console.WriteLine($"SUCCESS: DELETE /api/reports/{id} completed");
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-010: DELETE /api/reports/{id} failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-010", message = "Failed to delete report." });
        }
    }

    [HttpGet("{id:int}/timeline")]
    public async Task<IActionResult> GetTimeline(int id)
    {
        Console.WriteLine($"ENTER: GET /api/reports/{id}/timeline");
        try
        {
            var timeline = await _db.GetTimelineAsync(id);
            Console.WriteLine($"SUCCESS: GET /api/reports/{id}/timeline returned {timeline.Count()} events");
            return Ok(timeline);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-API-011: GET /api/reports/{id}/timeline failed. {ex.Message}");
            return StatusCode(500, new { errorCode = "ERR-API-011", message = "Failed to retrieve timeline." });
        }
    }
}

public class StatusUpdateRequest
{
    public string Status { get; set; } = string.Empty;
}
