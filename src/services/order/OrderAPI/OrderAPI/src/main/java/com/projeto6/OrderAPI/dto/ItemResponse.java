package com.projeto6.OrderAPI.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "DTO de resposta para um item do pedido")
public class ItemResponse {

    @Schema(
        description = "ID do produto",
        example = "550e8400-e29b-41d4-a716-446655440000"
    )
    private UUID productId;

    @Schema(
        description = "Quantidade do produto no pedido",
        example = "2"
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