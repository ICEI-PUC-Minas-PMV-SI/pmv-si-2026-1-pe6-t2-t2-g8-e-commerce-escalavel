package com.projeto6.OrderAPI.dto;

/**
 * Body opcional do POST /orders/{id}/pay. paymentMethod é informativo
 * (credit_card | debit_card | pix) — a simulação não o utiliza.
 */
public class PayRequest {

    private String paymentMethod;

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
