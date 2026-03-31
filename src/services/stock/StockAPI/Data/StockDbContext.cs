using Microsoft.EntityFrameworkCore;
using StockAPI.Models;

namespace StockAPI.Data;

public class StockDbContext : DbContext
{
    public StockDbContext(DbContextOptions<StockDbContext> options) : base(options) { }

    public DbSet<StockItem> StockItems => Set<StockItem>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("stock");

        modelBuilder.Entity<StockItem>(e =>
        {
            e.ToTable("stock_items");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ProductId).IsUnique();
            e.Property(x => x.ProductId)
                .IsRequired()
                .ValueGeneratedOnAdd()
                .HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.RowVersion)
                .HasColumnName("row_version")
                .IsRowVersion()
                .IsConcurrencyToken();
        });

        modelBuilder.Entity<StockMovement>(e =>
        {
            e.ToTable("stock_movements");
            e.HasKey(x => x.Id);
            e.Property(x => x.ProductId).IsRequired();
            e.Property(x => x.Type)
                .HasConversion<string>()
                .HasMaxLength(20);
            e.Property(x => x.CreatedAt)
                .HasDefaultValueSql("NOW()");
            e.HasIndex(x => x.ProductId);
            e.HasIndex(x => x.OrderId);
        });
    }
}
