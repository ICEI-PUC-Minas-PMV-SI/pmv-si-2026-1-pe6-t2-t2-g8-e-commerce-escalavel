package com.projeto6.OrderAPI.model;

import jakarta.persistence.Embeddable;
import java.util.UUID;

@Embeddable
public class Item {

    private UUID productId;
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