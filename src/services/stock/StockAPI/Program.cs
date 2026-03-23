using Microsoft.EntityFrameworkCore;
using StockAPI.Data;
using StockAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Database ─────────────────────────────────────────────
builder.Services.AddDbContext<StockDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// ── Services ─────────────────────────────────────────────
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// ── Ensure database schema and tables exist ──────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StockDbContext>();
    db.Database.EnsureCreated();
}

// ── Middleware pipeline ──────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();
