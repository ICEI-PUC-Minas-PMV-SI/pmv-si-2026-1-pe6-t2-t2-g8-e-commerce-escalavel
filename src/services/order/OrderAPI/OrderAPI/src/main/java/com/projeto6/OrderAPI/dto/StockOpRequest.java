package com.projeto6.OrderAPI.dto;

public class StockOpRequest {

    private final int quantity;

    public StockOpRequest(int quantity) {
        this.quantity = quantity;
    }

    public int getQuantity() {
        return quantity;
    }
}
