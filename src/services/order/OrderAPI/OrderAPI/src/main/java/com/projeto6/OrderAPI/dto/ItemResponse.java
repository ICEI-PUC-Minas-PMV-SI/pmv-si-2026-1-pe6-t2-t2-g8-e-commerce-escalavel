package com.projeto6.OrderAPI.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO de resposta para um item do pedido")
public class ItemResponse {

    @Schema(
        description = "ID do produto",
        example = "200"
    )
    private Long productId;

    @Schema(
        description = "Quantidade do produto no pedido",
        example = "2"
    )
    private Integer quantity;

    // Getters e Setters
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}