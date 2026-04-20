package com.projeto6.OrderAPI.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID customerId;

    private String status;

    // Lista de itens do pedido
    @ElementCollection
    @CollectionTable(name = "order_items_collection", joinColumns = @JoinColumn(name = "order_id"))
    private List<Item> items;

    //Getters e Setters
    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }
}