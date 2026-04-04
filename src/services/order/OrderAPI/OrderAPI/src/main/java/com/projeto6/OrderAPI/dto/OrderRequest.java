package main.java.com.projeto6.OrderAPI.dto;

import java.util.List;

// DTO responsável por representar os dados de entrada para criar pedido
public class OrderRequest {

    private Long userId;
    private List<OrderItemRequest> items;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}