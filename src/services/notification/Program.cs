using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MassTransit;

var builder = Microsoft.Extensions.Hosting.Host.CreateApplicationBuilder(args);

// 1. BANCO DE DADOS (via env var ConnectionStrings__Default)
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("ConnectionStrings__Default is required.");
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));

// 2. RABBITMQ (via env var RABBITMQ_URL)
var rabbitMqUrl = builder.Configuration["RABBITMQ_URL"]
    ?? throw new InvalidOperationException("RABBITMQ_URL is required.");
builder.Services.AddMassTransit(x => {
    x.AddConsumer<NotificationConsumer>();

    x.UsingRabbitMq((context, cfg) => {
        cfg.Host(new Uri(rabbitMqUrl));

        cfg.ReceiveEndpoint("notifications", e => {
            e.ConfigureConsumer<NotificationConsumer>(context);
        });
    });
});

var host = builder.Build();

// ✔ GARANTE QUE O BANCO EXISTE
using (var scope = host.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

host.Run();


// =======================
// MODELOS
// =======================

public class NotificationLog {
    public int Id { get; set; }
    public string Message { get; set; } = "";
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}

// =======================
// DB CONTEXT
// =======================

public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<NotificationLog> Notifications => Set<NotificationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("notifications");
    }
}

// =======================
// EVENTO (COMPATÍVEL COM JAVA)
// =======================

public record OrderCreatedEvent(long OrderId, string CustomerEmail);

// =======================
// CONSUMER
// =======================

public class NotificationConsumer : IConsumer<OrderCreatedEvent> {
    private readonly AppDbContext _db;

    public NotificationConsumer(AppDbContext db) => _db = db;

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context) {
        var email = context.Message.CustomerEmail;

        Console.WriteLine($"[NotificationService] Email enviado para {email}");

        _db.Notifications.Add(new NotificationLog {
            Message = $"Email enviado para {email}"
        });

        await _db.SaveChangesAsync();
    }
}
