using Microsoft.EntityFrameworkCore;
using MassTransit;

var builder = Host.CreateApplicationBuilder(args);

// 1. CONFIGURAÇÃO DO BANCO DE DADOS 
var connectionString = "Host=localhost;Database=ecommerce;Username=ecom;Password=ecom123";
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));

// 2. CONFIGURAÇÃO DO RABBITMQ (Mensageria)
builder.Services.AddMassTransit(x => {
    x.AddConsumer<NotificationConsumer>();
    x.UsingRabbitMq((context, cfg) => {
        cfg.Host("localhost", "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.ReceiveEndpoint("fila-notificacao", e => e.ConfigureConsumer<NotificationConsumer>(context));
    });
});

var host = builder.Build();
host.Run();

// --- CÓDIGO GERAL ---

// Modelo do que vai ser salvo no banco
public class NotificationLog {
    public int Id { get; set; }
    public string Message { get; set; } = "";
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}

// Configuração do Banco de Dados
public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<NotificationLog> Notifications => Set<NotificationLog>();
}

// Contrato da Mensagem (dados do OrderService)
public record OrderCreatedEvent(Guid OrderId, string CustomerEmail);

// Responsável por ler a fila
public class NotificationConsumer : IConsumer<OrderCreatedEvent> {
    private readonly AppDbContext _db;
    public NotificationConsumer(AppDbContext db) => _db = db;

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context) {
        var email = context.Message.CustomerEmail;
        Console.WriteLine($"🔔 NOTIFICAÇÃO: Enviando e-mail para {email}");
        
        // Salva no banco 
        _db.Notifications.Add(new NotificationLog { Message = $"E-mail enviado para {email}" });
        await _db.SaveChangesAsync();
    }
}
