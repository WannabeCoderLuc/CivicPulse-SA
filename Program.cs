using CivicPulse_SA.Services;

Console.WriteLine("INIT: CivicPulse SA API starting up");

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CivicPulse SA API", Version = "v1", Description = "Municipal Infrastructure Management Platform — City of Cape Town" });
});

builder.Services.AddSingleton<DatabaseService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CivicPulsePolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

Console.WriteLine("INIT: Middleware pipeline configuring");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CivicPulse SA API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("CivicPulsePolicy");

app.UseAuthorization();

app.MapControllers();

try
{
    app.Services.GetRequiredService<DatabaseService>();
    Console.WriteLine("SUCCESS: DatabaseService initialised and ready");
}
catch (Exception ex)
{
    Console.WriteLine($"ERR-STARTUP-001: DatabaseService failed to initialise. {ex.Message}");
}

Console.WriteLine("SUCCESS: CivicPulse SA API running on http://localhost:5000");
app.Run();
