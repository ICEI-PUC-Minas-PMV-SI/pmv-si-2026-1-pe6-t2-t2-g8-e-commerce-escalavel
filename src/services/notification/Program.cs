using Microsoft.EntityFrameworkCore;
using MassTransit;
using Microsoft.Extensions.Options;

var builder = Host.CreateApplicationBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("ConnectionStrings:Default is required.");

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connectionString));

builder.Services.Configure<RabbitMqOptions>(builder.Configuration.GetSection("RabbitMq"));

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<NotificationConsumer>();
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitOptions = context.GetRequiredService<IOptions<RabbitMqOptions>>().Value;

        cfg.Host(rabbitOptions.Host, rabbitOptions.VirtualHost, h =>
        {
            h.Username(rabbitOptions.Username);
            h.Password(rabbitOptions.Password);
        });

        cfg.ReceiveEndpoint(rabbitOptions.QueueName, e =>
            e.ConfigureConsumer<NotificationConsumer>(context));
    });
});

var host = builder.Build();

using (var scope = host.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

host.Run();

public sealed class RabbitMqOptions
{
    public string Host { get; init; } = "localhost";
    public string VirtualHost { get; init; } = "/";
    public string Username { get; init; } = "guest";
    public string Password { get; init; } = "guest";
    public string QueueName { get; init; } = "fila-notificacao";
}

public class NotificationLog
{
    public int Id { get; set; }
    public string Message { get; set; } = "";
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<NotificationLog> Notifications => Set<NotificationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("notifications");

        modelBuilder.Entity<NotificationLog>(entity =>
        {
            entity.ToTable("notification_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired();
            entity.Property(e => e.SentAt).HasDefaultValueSql("NOW()");
        });
    }
}

public record OrderCreatedEvent(Guid OrderId, string CustomerEmail);

public class NotificationConsumer : IConsumer<OrderCreatedEvent>
{
    private readonly AppDbContext _db;
    private readonly ILogger<NotificationConsumer> _logger;

    public NotificationConsumer(AppDbContext db, ILogger<NotificationConsumer> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        var email = context.Message.CustomerEmail;
        _logger.LogInformation("Enviando notificacao para {Email}", email);

        _db.Notifications.Add(new NotificationLog { Message = $"E-mail enviado para {email}" });
        await _db.SaveChangesAsync();
    }
}
