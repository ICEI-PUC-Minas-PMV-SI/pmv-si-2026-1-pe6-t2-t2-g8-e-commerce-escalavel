using Microsoft.EntityFrameworkCore;
using StockAPI.Models;

namespace StockAPI.Data;

public class StockDbContext : DbContext
{
    public StockDbContext(DbContextOptions<StockDbContext> options) : base(options) { }

    public DbSet<StockItem> StockItems => Set<StockItem>();
    public DbSet<StockReservation> StockReservations => Set<StockReservation>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("stock");

        modelBuilder.Entity<StockItem>(e =>
        {
            e.ToTable("stock_items");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.SkuId).IsUnique();
            e.Property(x => x.SkuId).IsRequired();
            e.Property(x => x.CostPrice).HasPrecision(18, 2).IsRequired();
        });

        modelBuilder.Entity<StockReservation>(e =>
        {
            e.ToTable("stock_reservations");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SkuId, x.OrderId }).IsUnique();
            e.HasIndex(x => x.SkuId);
            e.HasIndex(x => x.OrderId);
            e.Property(x => x.SkuId).IsRequired();
            e.Property(x => x.OrderId).IsRequired();
            e.Property(x => x.QuantityReserved).IsRequired();
        });

        modelBuilder.Entity<StockMovement>(e =>
        {
            e.ToTable("stock_movements");
            e.HasKey(x => x.Id);
            e.Property(x => x.SkuId).IsRequired();
            e.Property(x => x.Type)
                .HasConversion<string>()
                .HasMaxLength(20);
            e.Property(x => x.CreatedAt)
                .HasDefaultValueSql("NOW()");
            e.HasIndex(x => x.SkuId);
            e.HasIndex(x => x.OrderId);
        });
    }
}
