package com.projeto6.OrderAPI.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "DTO para representar um item no pedido")
public class ItemRequest {

    @Schema(
        description = "ID do produto que será incluído no pedido",
        example = "550e8400-e29b-41d4-a716-446655440000",
        required = true
    )
    private UUID productId;

    @Schema(
        description = "Quantidade do produto no pedido",
        example = "2",
        required = true
    )
    private Integer quantity;

    // TODO: substituir por lookup no CatalogAPI para evitar fraude de preço
    @Schema(
        description = "Preço unitário (temporário — ideal: vir do CatalogAPI)",
        example = "29.90",
        required = true
    )
    private BigDecimal price;

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
