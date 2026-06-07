package com.projeto6.OrderAPI.exception;

/**
 * Lançada pelo PaymentClient quando a PaymentAPI recusa o pagamento (HTTP 402).
 * Tratada dentro do OrderService (libera estoque + marca PAYMENT_FAILED).
 */
public class PaymentDeclinedException extends RuntimeException {

    public PaymentDeclinedException(String message) {
        super(message);
    }
}
