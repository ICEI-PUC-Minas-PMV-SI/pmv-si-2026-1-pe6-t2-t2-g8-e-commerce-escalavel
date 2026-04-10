package com.projeto6.OrderAPI.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para representar um item no pedido")
public class ItemRequest {

    @Schema(
        description = "ID do produto que será incluído no pedido",
        example = "200",
        required = true
    )
    private Long productId;

    @Schema(
        description = "Quantidade do produto no pedido",
        example = "2",
        required = true
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