package com.projeto6.OrderAPI.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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

    // Getters e Setters
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
}