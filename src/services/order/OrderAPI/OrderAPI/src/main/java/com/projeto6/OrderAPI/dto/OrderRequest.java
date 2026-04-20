package com.projeto6.OrderAPI.dto;

import java.util.List;
import java.util.UUID;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para criação de um pedido")
public class OrderRequest {

    @Schema(
        description = "ID do cliente que está fazendo o pedido",
        example = "550e8400-e29b-41d4-a716-446655440000",
        required = true
    )
    private UUID customerId;

    @Schema(
        description = "Lista de itens que compõem o pedido",
        required = true
    )
    private List<ItemRequest> items;

    // Getters e Setters
    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public List<ItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemRequest> items) {
        this.items = items;
    }
}