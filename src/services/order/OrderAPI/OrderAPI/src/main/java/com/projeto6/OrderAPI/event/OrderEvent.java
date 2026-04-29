package com.projeto6.OrderAPI.event;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderEvent(
        UUID orderId,
        UUID customerId,
        String customerEmail,
        String eventType,
        BigDecimal totalAmount
) {
    public static final String ORDER_CONFIRMED = "ORDER_CONFIRMED";
    public static final String PAYMENT_REFUSED = "PAYMENT_REFUSED";
    public static final String ORDER_CANCELLED = "ORDER_CANCELLED";
}
