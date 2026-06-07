package com.projeto6.OrderAPI.dto;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO de resposta de um pedido")
public class OrderResponse {

    @Schema(
        description = "ID único do pedido",
        example = "550e8400-e29b-41d4-a716-446655440000"
    )
    private UUID id;

    @Schema(
        description = "ID do cliente que realizou o pedido",
        example = "550e8400-e29b-41d4-a716-446655440000"
    )
    private UUID customerId;

    @Schema(
        description = "Lista de itens presentes no pedido"
    )
    private List<ItemResponse> items;

    @Schema(
        description = "Status atual do pedido",
        example = "CREATED"
    )
    private String status;

    @Schema(
        description = "ID da transação de pagamento (preenchido quando aprovado)",
        example = "TRX-837462"
    )
    private String transactionId;

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
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

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}