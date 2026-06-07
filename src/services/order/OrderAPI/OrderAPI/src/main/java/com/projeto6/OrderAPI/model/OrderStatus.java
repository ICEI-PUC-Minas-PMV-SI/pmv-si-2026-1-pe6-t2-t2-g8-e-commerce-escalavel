package com.projeto6.OrderAPI.model;

/**
 * Status possíveis de um pedido. Centraliza os valores para evitar magic strings
 * espalhadas por service/controller.
 */
public final class OrderStatus {

    private OrderStatus() {
    }

    public static final String CREATED = "CREATED";
    public static final String PAID = "PAID";
    public static final String CANCELLED = "CANCELLED";
    public static final String PAYMENT_FAILED = "PAYMENT_FAILED";
}
