package main.java.com.projeto6.OrderAPI.dto;

import java.util.List;

public class OrderRequest {

    private Long customerId;
    private List<ItemRequest> items;

    // Getters e Setters
    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<ItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemRequest> items) {
        this.items = items;
    }
}