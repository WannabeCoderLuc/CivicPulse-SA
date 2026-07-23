using Dapper;
using Microsoft.Data.Sqlite;
using CivicPulse_SA.Models;


/* Sample data is based off south africa, cape town, and south african names to make my demo as real as possible */

namespace CivicPulse_SA.Services;

public class DatabaseService
{
    private readonly string _connectionString;
    /* Database creation, this runs does runs when application startup is intiated via program.cs  */
    public DatabaseService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=civicpulse.db";
        Console.WriteLine("INIT: DatabaseService constructed");
        InitialiseDatabase();
    }

    private SqliteConnection CreateConnection()
    {
        return new SqliteConnection(_connectionString);
    }

    private void InitialiseDatabase()
    {
        Console.WriteLine("ENTER: InitialiseDatabase"); /* initial table execution */
        try
        {
            using var connection = CreateConnection();
            connection.Open();

            connection.Execute(@"
                CREATE TABLE IF NOT EXISTS Reports (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Title TEXT NOT NULL,
                    Description TEXT NOT NULL,
                    Category TEXT NOT NULL,
                    Status TEXT NOT NULL DEFAULT 'Reported',
                    Ward TEXT NOT NULL,
                    Latitude REAL NOT NULL,
                    Longitude REAL NOT NULL,
                    ImageUrl TEXT,
                    ReportedBy TEXT,
                    CreatedAt TEXT NOT NULL,
                    UpdatedAt TEXT NOT NULL
                );
            ");

            connection.Execute(@"
                CREATE TABLE IF NOT EXISTS TimelineEvents (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ReportId INTEGER NOT NULL,
                    Stage TEXT NOT NULL,
                    Note TEXT,
                    PerformedBy TEXT,
                    Timestamp TEXT NOT NULL,
                    FOREIGN KEY (ReportId) REFERENCES Reports(Id)
                );
            ");

            SeedDataIfEmpty(connection);

            Console.WriteLine("SUCCESS: InitialiseDatabase complete");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-001: Database initialisation failed. {ex.Message}");
            throw;
        }
    }

    private void SeedDataIfEmpty(SqliteConnection connection)
    {
        Console.WriteLine("ENTER: SeedDataIfEmpty");
        var count = connection.ExecuteScalar<int>("SELECT COUNT(*) FROM Reports");
        if (count > 0)
        {
            Console.WriteLine("INFO: Seed skipped � data already exists");
            return;
        }
    /* Sample data using CT as example, these r the reports */
        var reports = new List<Report>
        {
            new() { Title = "Burst Water Main", Description = "Water gushing from ruptured main on Voortrekker Road", Category = "Water", Status = "Urgent", Ward = "Ward 28", Latitude = -33.9249, Longitude = 18.4241, ReportedBy = "Sipho Dlamini", CreatedAt = DateTime.UtcNow.AddDays(-5), UpdatedAt = DateTime.UtcNow.AddDays(-5) },
            new() { Title = "Pothole Taxi Route", Description = "Large pothole causing vehicle damage near taxi rank", Category = "Roads", Status = "In Progress", Ward = "Ward 15", Latitude = -33.9310, Longitude = 18.4650, ReportedBy = "Zanele Mokoena", CreatedAt = DateTime.UtcNow.AddDays(-4), UpdatedAt = DateTime.UtcNow.AddDays(-2) },
            new() { Title = "Street Light Outage", Description = "Five consecutive street lights not functioning since Monday", Category = "Electricity", Status = "Reported", Ward = "Ward 7", Latitude = -33.9180, Longitude = 18.4320, ReportedBy = "Thabo Nkosi", CreatedAt = DateTime.UtcNow.AddDays(-3), UpdatedAt = DateTime.UtcNow.AddDays(-3) },
            new() { Title = "Illegal Dumping Site", Description = "Refuse accumulation on vacant lot attracting vermin", Category = "Waste", Status = "Verified", Ward = "Ward 33", Latitude = -33.9400, Longitude = 18.4100, ReportedBy = "Lerato Sithole", CreatedAt = DateTime.UtcNow.AddDays(-7), UpdatedAt = DateTime.UtcNow.AddDays(-1) },
            new() { Title = "Blocked Sewer Line", Description = "Raw sewage overflow on pavement outside No. 14 Buitenkant St", Category = "Sewer", Status = "Assigned", Ward = "Ward 77", Latitude = -33.9260, Longitude = 18.4190, ReportedBy = "Nomsa Khumalo", CreatedAt = DateTime.UtcNow.AddDays(-2), UpdatedAt = DateTime.UtcNow.AddDays(-1) },
            new() { Title = "Water Meter Theft", Description = "Water meter cover stolen, exposed fitting causing loss", Category = "Water", Status = "Completed", Ward = "Ward 28", Latitude = -33.9270, Longitude = 18.4260, ReportedBy = "Andile Zulu", CreatedAt = DateTime.UtcNow.AddDays(-10), UpdatedAt = DateTime.UtcNow.AddDays(-1) },
            new() { Title = "Road Subsidence", Description = "Road surface sinking near storm drain on Main Road", Category = "Roads", Status = "Urgent", Ward = "Ward 64", Latitude = -33.9350, Longitude = 18.4500, ReportedBy = "Fatima Hendricks", CreatedAt = DateTime.UtcNow.AddDays(-1), UpdatedAt = DateTime.UtcNow.AddDays(-1) },
            new() { Title = "Transformer Fault", Description = "Transformer humming loudly and sparking intermittently", Category = "Electricity", Status = "Repair Started", Ward = "Ward 15", Latitude = -33.9290, Longitude = 18.4680, ReportedBy = "Piet van der Merwe", CreatedAt = DateTime.UtcNow.AddDays(-6), UpdatedAt = DateTime.UtcNow },
            new() { Title = "Overflowing Skip Bins", Description = "Municipal skip bins overflowing at community centre", Category = "Waste", Status = "Completed", Ward = "Ward 7", Latitude = -33.9160, Longitude = 18.4350, ReportedBy = "Precious Mahlangu", CreatedAt = DateTime.UtcNow.AddDays(-8), UpdatedAt = DateTime.UtcNow.AddDays(-2) },
            new() { Title = "Sewer Collapse Informal Settlement", Description = "Sewer infrastructure collapsed beneath footpath", Category = "Sewer", Status = "Reported", Ward = "Ward 33", Latitude = -33.9420, Longitude = 18.4080, ReportedBy = "Bongani Cele", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
        };

        foreach (var report in reports)
        {
            var id = connection.ExecuteScalar<int>(@"
                INSERT INTO Reports (Title, Description, Category, Status, Ward, Latitude, Longitude, ImageUrl, ReportedBy, CreatedAt, UpdatedAt)
                VALUES (@Title, @Description, @Category, @Status, @Ward, @Latitude, @Longitude, @ImageUrl, @ReportedBy, @CreatedAt, @UpdatedAt);
                SELECT last_insert_rowid();",
                new { report.Title, report.Description, report.Category, report.Status, report.Ward, report.Latitude, report.Longitude, report.ImageUrl, report.ReportedBy, CreatedAt = report.CreatedAt.ToString("o"), UpdatedAt = report.UpdatedAt.ToString("o") });

            var stages = GetInitialStages(report.Status);
            foreach (var (stage, note, performer, offset) in stages)
            {
                connection.Execute(@"
                    INSERT INTO TimelineEvents (ReportId, Stage, Note, PerformedBy, Timestamp)
                    VALUES (@ReportId, @Stage, @Note, @PerformedBy, @Timestamp);",
                    new { ReportId = id, Stage = stage, Note = note, PerformedBy = performer, Timestamp = report.CreatedAt.AddHours(offset).ToString("o") });
            }
        }

        Console.WriteLine("SUCCESS: Seed data inserted");
    }
    /* Below is the status of all reports, south african names for realism */
    private static List<(string, string, string, double)> GetInitialStages(string status)
    {
        var all = new List<(string, string, string, double)>
        {
            ("Reported", "Issue submitted by citizen via CivicPulse SA portal", "Citizen Portal", 0),
            ("Verified", "Field agent confirmed the issue on-site", "Inspector Mokoena", 2),
            ("Assigned", "Technician dispatched to affected area", "Dispatch Control", 4),
            ("Repair Started", "Maintenance crew commenced repair work", "Crew Leader Dlamini", 8),
            ("Completed", "Repair completed and quality check passed", "QA Supervisor Nkosi", 24),
        };

        var stageOrder = new[] { "Reported", "Verified", "Assigned", "Repair Started", "Completed" };
        var idx = Array.IndexOf(stageOrder, status);
        if (idx < 0) idx = 0;
        return all.Take(idx + 1).ToList();
    }

    public async Task<IEnumerable<Report>> GetAllReportsAsync()
    {
        Console.WriteLine("ENTER: GetAllReportsAsync");
        try
        {
            using var connection = CreateConnection();
            var reports = await connection.QueryAsync<Report>("SELECT * FROM Reports ORDER BY CreatedAt DESC");
            Console.WriteLine($"SUCCESS: GetAllReportsAsync returned {reports.Count()} records");
            return reports;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-002: GetAllReportsAsync failed. {ex.Message}");
            throw;
        }
    }

    public async Task<Report?> GetReportByIdAsync(int id)
    {
        Console.WriteLine($"ENTER: GetReportByIdAsync id={id}");
        try
        {
            using var connection = CreateConnection();
            var report = await connection.QueryFirstOrDefaultAsync<Report>("SELECT * FROM Reports WHERE Id = @Id", new { Id = id });
            Console.WriteLine(report != null ? $"SUCCESS: GetReportByIdAsync found report {id}" : $"INFO: Report {id} not found");
            return report;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-003: GetReportByIdAsync failed. {ex.Message}");
            throw;
        }
    }

    public async Task<int> CreateReportAsync(Report report)
    {
        Console.WriteLine("ENTER: CreateReportAsync");
        try
        {
            using var connection = CreateConnection();
            report.CreatedAt = DateTime.UtcNow;
            report.UpdatedAt = DateTime.UtcNow;
            report.Status = "Reported";

            var id = await connection.ExecuteScalarAsync<int>(@"
                INSERT INTO Reports (Title, Description, Category, Status, Ward, Latitude, Longitude, ImageUrl, ReportedBy, CreatedAt, UpdatedAt)
                VALUES (@Title, @Description, @Category, @Status, @Ward, @Latitude, @Longitude, @ImageUrl, @ReportedBy, @CreatedAt, @UpdatedAt);
                SELECT last_insert_rowid();",
                new { report.Title, report.Description, report.Category, report.Status, report.Ward, report.Latitude, report.Longitude, report.ImageUrl, report.ReportedBy, CreatedAt = report.CreatedAt.ToString("o"), UpdatedAt = report.UpdatedAt.ToString("o") });

            await connection.ExecuteAsync(@"
                INSERT INTO TimelineEvents (ReportId, Stage, Note, PerformedBy, Timestamp)
                VALUES (@ReportId, @Stage, @Note, @PerformedBy, @Timestamp);",
                new { ReportId = id, Stage = "Reported", Note = "Issue submitted by citizen via CivicPulse SA portal", PerformedBy = report.ReportedBy, Timestamp = report.CreatedAt.ToString("o") });

            Console.WriteLine($"SUCCESS: DB_WRITE_COMPLETE � new report id={id}");
            return id;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-004: CreateReportAsync failed. {ex.Message}");
            throw;
        }
    }

    public async Task<bool> UpdateReportStatusAsync(int id, string status)
    {
        Console.WriteLine($"ENTER: UpdateReportStatusAsync id={id} status={status}");
        try
        {
            using var connection = CreateConnection();
            var updated = await connection.ExecuteAsync(@"
                UPDATE Reports SET Status = @Status, UpdatedAt = @UpdatedAt WHERE Id = @Id",
                new { Status = status, UpdatedAt = DateTime.UtcNow.ToString("o"), Id = id });

            if (updated > 0)
            { /* these are statuses which can be viewed by the admin */
                var note = status switch
                {
                    "Verified" => "Field agent confirmed the issue on-site",
                    "Assigned" => "Technician dispatched to affected area",
                    "Repair Started" => "Maintenance crew commenced repair work",
                    "Completed" => "Repair completed and quality check passed",
                    _ => $"Status updated to {status}"
                };

                await connection.ExecuteAsync(@"
                    INSERT INTO TimelineEvents (ReportId, Stage, Note, PerformedBy, Timestamp)
                    VALUES (@ReportId, @Stage, @Note, @PerformedBy, @Timestamp);",
                    new { ReportId = id, Stage = status, Note = note, PerformedBy = "Municipality Admin", Timestamp = DateTime.UtcNow.ToString("o") });

                Console.WriteLine($"SUCCESS: Status updated for report {id} to {status}");
            }

            return updated > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-005: UpdateReportStatusAsync failed. {ex.Message}");
            throw;
        }
    }

    public async Task<bool> DeleteReportAsync(int id)
    {
        Console.WriteLine($"ENTER: DeleteReportAsync id={id}");
        try
        {
            using var connection = CreateConnection();
            await connection.ExecuteAsync("DELETE FROM TimelineEvents WHERE ReportId = @Id", new { Id = id });
            var deleted = await connection.ExecuteAsync("DELETE FROM Reports WHERE Id = @Id", new { Id = id });
            Console.WriteLine($"SUCCESS: DeleteReportAsync � report {id} removed");
            return deleted > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-006: DeleteReportAsync failed. {ex.Message}");
            throw;
        }
    }

    public async Task<IEnumerable<TimelineEvent>> GetTimelineAsync(int reportId)
    {
        Console.WriteLine($"ENTER: GetTimelineAsync reportId={reportId}");
        try
        {
            using var connection = CreateConnection();
            var events = await connection.QueryAsync<TimelineEvent>(
                "SELECT * FROM TimelineEvents WHERE ReportId = @ReportId ORDER BY Timestamp ASC",
                new { ReportId = reportId });
            Console.WriteLine($"SUCCESS: GetTimelineAsync returned {events.Count()} events for report {reportId}");
            return events;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-007: GetTimelineAsync failed. {ex.Message}");
            throw;
        }
    }

    public async Task<KpiSummary> GetKpiSummaryAsync()
    {
        Console.WriteLine("ENTER: GetKpiSummaryAsync");
        try
        {
            using var connection = CreateConnection();
            var total = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Reports");
            var resolved = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Reports WHERE Status = 'Completed'");
            var inProgress = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Reports WHERE Status IN ('Verified','Assigned','Repair Started')");
            var urgent = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Reports WHERE Status = 'Urgent'");
            var pending = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Reports WHERE Status = 'Reported'");

            var summary = new KpiSummary { TotalReports = total, Resolved = resolved, Pending = pending, InProgress = inProgress, Urgent = urgent };
            Console.WriteLine($"SUCCESS: GetKpiSummaryAsync � Total={total} Resolved={resolved} Pending={pending}");
            return summary;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-008: GetKpiSummaryAsync failed. {ex.Message}");
            throw;
        }
    }

    public async Task<IEnumerable<CategoryCount>> GetReportsByCategoryAsync()
    {
        Console.WriteLine("ENTER: GetReportsByCategoryAsync");
        try
        {
            using var connection = CreateConnection();
            var results = await connection.QueryAsync<CategoryCount>(
                "SELECT Category, COUNT(*) as Count FROM Reports GROUP BY Category ORDER BY Count DESC");
            Console.WriteLine("SUCCESS: GetReportsByCategoryAsync complete");
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-009: GetReportsByCategoryAsync failed. {ex.Message}");
            throw;
        }
    }

    public async Task<IEnumerable<WardPerformance>> GetWardPerformanceAsync()
    {
        Console.WriteLine("ENTER: GetWardPerformanceAsync");
        try
        {
            using var connection = CreateConnection();
            var results = await connection.QueryAsync<WardPerformance>(@"
                SELECT Ward,
                       COUNT(*) as Total,
                       SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as Resolved
                FROM Reports
                GROUP BY Ward
                ORDER BY Total DESC");
            Console.WriteLine("SUCCESS: GetWardPerformanceAsync complete");
            return results;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERR-DB-010: GetWardPerformanceAsync failed. {ex.Message}");
            throw;
        }
    }
}
