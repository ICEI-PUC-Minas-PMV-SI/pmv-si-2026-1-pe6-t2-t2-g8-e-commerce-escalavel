package main.java.com.projeto6.OrderAPI.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Item {

    private Long productId;
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