package main.java.com.projeto6.OrderAPI.model;

import jakarta.persistence.*;

// Entidade que representa um item dentro de um pedido.

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID do produto
    private Long productId;

    // Quantidade do produto no pedido
    private Integer quantity;

    // Preço unitário do produto
    private Double price;

    // Getters e Setters
    public Long getId() {
        return id;
    }

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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}