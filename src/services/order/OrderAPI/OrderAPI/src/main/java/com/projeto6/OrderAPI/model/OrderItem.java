package com.projeto6.OrderAPI.model;

import jakarta.persistence.*;
import java.util.UUID;

// Entidade que representa um item dentro de um pedido.

@Entity
@Table(name = "order_items_entity")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ID do produto
    private UUID productId;

    // Quantidade do produto no pedido
    private Integer quantity;

    // Preço unitário do produto
    private Double price;

    // Getters e Setters
    public UUID getId() {
        return id;
    }

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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}