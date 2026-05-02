using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialStockSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "stock");

            migrationBuilder.CreateTable(
                name: "stock_items",
                schema: "stock",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SkuId = table.Column<Guid>(type: "uuid", nullable: false),
                    CostPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    QuantityAvailable = table.Column<int>(type: "integer", nullable: false),
                    QuantityReserved = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_items", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "stock_movements",
                schema: "stock",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SkuId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_movements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "stock_reservations",
                schema: "stock",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SkuId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityReserved = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_reservations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_stock_items_SkuId",
                schema: "stock",
                table: "stock_items",
                column: "SkuId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_OrderId",
                schema: "stock",
                table: "stock_movements",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_SkuId",
                schema: "stock",
                table: "stock_movements",
                column: "SkuId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_reservations_OrderId",
                schema: "stock",
                table: "stock_reservations",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_reservations_SkuId",
                schema: "stock",
                table: "stock_reservations",
                column: "SkuId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_reservations_SkuId_OrderId",
                schema: "stock",
                table: "stock_reservations",
                columns: new[] { "SkuId", "OrderId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "stock_items",
                schema: "stock");

            migrationBuilder.DropTable(
                name: "stock_movements",
                schema: "stock");

            migrationBuilder.DropTable(
                name: "stock_reservations",
                schema: "stock");
        }
    }
}
