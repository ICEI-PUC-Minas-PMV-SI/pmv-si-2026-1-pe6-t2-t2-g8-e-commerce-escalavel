using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StockAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddStockRowVersion : Migration
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
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityAvailable = table.Column<int>(type: "integer", nullable: false),
                    QuantityReserved = table.Column<int>(type: "integer", nullable: false),
                    row_version = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: false)
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
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_movements", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_stock_items_ProductId",
                schema: "stock",
                table: "stock_items",
                column: "ProductId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_OrderId",
                schema: "stock",
                table: "stock_movements",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_ProductId",
                schema: "stock",
                table: "stock_movements",
                column: "ProductId");
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
        }
    }
}
