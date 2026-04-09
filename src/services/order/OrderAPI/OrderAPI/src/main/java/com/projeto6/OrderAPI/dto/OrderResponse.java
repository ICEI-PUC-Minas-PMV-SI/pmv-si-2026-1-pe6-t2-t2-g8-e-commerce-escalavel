package com.projeto6.OrderAPI.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO de resposta de um pedido")
public class OrderResponse {

    @Schema(
        description = "ID único do pedido",
        example = "100"
    )
    private Long id;

    @Schema(
        description = "ID do cliente que realizou o pedido",
        example = "1"
    )
    private Long customerId;

    @Schema(
        description = "Lista de itens presentes no pedido"
    )
    private List<ItemResponse> items;

    @Schema(
        description = "Status atual do pedido",
        example = "CRIADO"
    )
    private String status;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<ItemResponse> getItems() {
        return items;
    }

    public void setItems(List<ItemResponse> items) {
        this.items = items;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}