package com.projeto6.OrderAPI.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para criação de um pedido")
public class OrderRequest {

    @Schema(
        description = "ID do cliente que está fazendo o pedido",
        example = "1",
        required = true
    )
    private Long customerId;

    @Schema(
        description = "Lista de itens que compõem o pedido",
        required = true
    )
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