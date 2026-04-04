package main.java.com.projeto6.OrderAPI.model;

import jakarta.persistence.*;
import java.util.List;

// Entidade que representa um pedido no sistema.

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID do usuário que fez o pedido
    private Long userId;

    // Valor total do pedido
    private Double total;

    // Status do pedido (CREATED, PAID, FAILED, etc.)
    private String status;


// Lista de itens do pedido.
    @OneToMany(cascade = CascadeType.ALL)
    private List<OrderItem> items;

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}