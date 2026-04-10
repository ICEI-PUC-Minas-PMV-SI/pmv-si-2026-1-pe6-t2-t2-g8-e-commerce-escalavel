using Microsoft.EntityFrameworkCore;
using MassTransit;

var builder = Host.CreateApplicationBuilder(args);

// 1. CONFIGURAÇÃO DO BANCO DE DADOS
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("ConnectionStrings__Default is required.");
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));

// 2. CONFIGURAÇÃO DO RABBITMQ (Mensageria)
var rabbitMqUrl = builder.Configuration["RABBITMQ_URL"]
    ?? throw new InvalidOperationException("RABBITMQ_URL is required.");
builder.Services.AddMassTransit(x => {
    x.AddConsumer<NotificationConsumer>();
    x.UsingRabbitMq((context, cfg) => {
        cfg.Host(new Uri(rabbitMqUrl));
        cfg.ReceiveEndpoint("fila-notificacao", e => e.ConfigureConsumer<NotificationConsumer>(context));
    });
});

var host = builder.Build();

// Garante que o schema e a tabela existam na primeira execução
using (var scope = host.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

host.Run();

// --- CÓDIGO GERAL ---

// Modelo do que vai ser salvo no banco
public class NotificationLog {
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Message { get; set; } = "";
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}

// Configuração do Banco de Dados
public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<NotificationLog> Notifications => Set<NotificationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("notifications");
    }
}

// Contrato da Mensagem (dados do OrderService)
public record OrderCreatedEvent(Guid OrderId, string CustomerEmail);

// Responsável por ler a fila
public class NotificationConsumer : IConsumer<OrderCreatedEvent> {
    private readonly AppDbContext _db;
    private readonly ILogger<NotificationConsumer> _logger;

    public NotificationConsumer(AppDbContext db, ILogger<NotificationConsumer> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context) {
        var email = context.Message.CustomerEmail;
        _logger.LogInformation("Enviando notificação para {Email}", email);

        try
        {
            _db.Notifications.Add(new NotificationLog { Message = $"E-mail enviado para {email}" });
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao persistir notificação para {Email}", email);
            throw;
        }
    }
}
