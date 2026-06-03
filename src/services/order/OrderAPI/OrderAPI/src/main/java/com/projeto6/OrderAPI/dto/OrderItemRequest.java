package com.projeto6.OrderAPI.dto;

import java.util.UUID;

// DTO que representa um item dentro do pedido.
public class OrderItemRequest {

    private UUID productId;
    private Integer quantity;

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