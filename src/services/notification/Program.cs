using Microsoft.EntityFrameworkCore;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

// CONFIGURAÇÃO DO BANCO E CORS
var connectionString = "Host=localhost;Database=ecommerce;Username=ecom;Password=ecom123";
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));
builder.Services.AddCors(); 

// CONFIGURAÇÃO DO RABBITMQ (Ouvindo Pedidos, Pagamentos e Estoque)
builder.Services.AddMassTransit(x => {
    x.AddConsumer<NotificationConsumer>();
    x.UsingRabbitMq((context, cfg) => {
        cfg.Host("localhost", "/", h => {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.ReceiveEndpoint("fila-notificacoes-geral", e => e.ConfigureConsumer<NotificationConsumer>(context));
    });
});

var app = builder.Build();

// ROTA PARA O FRONT-END (React chama aqui)
app.MapGet("/api/notifications", async (AppDbContext db) => 
    await db.Notifications.OrderByDescending(x => x.CreatedAt).ToListAsync());

app.UseCors(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
app.Run();

// --- MODELOS ---
public class Notification {
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string Type { get; set; } = "info"; // success, warning, error
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Notification> Notifications => Set<Notification>();
}

// --- EVENTOS DE INTEGRAÇÃO ---
public record OrderCreatedEvent(Guid OrderId, string CustomerEmail);
public record PaymentConfirmedEvent(Guid OrderId);
public record StockLowEvent(string ProductName);

// --- O CONSUMER (Lógica de Recebimento) ---
public class NotificationConsumer : 
    IConsumer<OrderCreatedEvent>, 
    IConsumer<PaymentConfirmedEvent>,
    IConsumer<StockLowEvent> 
{
    private readonly AppDbContext _db;
    public NotificationConsumer(AppDbContext db) => _db = db;

    public async Task Consume(ConsumeContext<OrderCreatedEvent> context) {
        _db.Notifications.Add(new Notification { 
            Title = "Pedido Criado", 
            Message = $"Pedido {context.Message.OrderId} recebido. Verifique seu e-mail: {context.Message.CustomerEmail}",
            Type = "info" 
        });
        await _db.SaveChangesAsync();
    }

    public async Task Consume(ConsumeContext<PaymentConfirmedEvent> context) {
        _db.Notifications.Add(new Notification { 
            Title = "Pagamento Aprovado", 
            Message = $"Sucesso! O pagamento do pedido {context.Message.OrderId} foi confirmado.",
            Type = "success" 
        });
        await _db.SaveChangesAsync();
    }

    public async Task Consume(ConsumeContext<StockLowEvent> context) {
        _db.Notifications.Add(new Notification { 
            Title = "Alerta de Estoque", 
            Message = $"O item {context.Message.ProductName} está com poucas unidades!",
            Type = "warning" 
        });
        await _db.SaveChangesAsync();
    }
}
