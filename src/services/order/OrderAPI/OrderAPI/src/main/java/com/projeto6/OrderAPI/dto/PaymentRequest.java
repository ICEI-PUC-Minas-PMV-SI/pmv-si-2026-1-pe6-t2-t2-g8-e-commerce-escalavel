package com.projeto6.OrderAPI.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Payload enviado à PaymentAPI (POST /payments/process).
 */
public class PaymentRequest {

    private final UUID orderId;
    private final BigDecimal value;

    public PaymentRequest(UUID orderId, BigDecimal value) {
        this.orderId = orderId;
        this.value = value;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public BigDecimal getValue() {
        return value;
    }
}
