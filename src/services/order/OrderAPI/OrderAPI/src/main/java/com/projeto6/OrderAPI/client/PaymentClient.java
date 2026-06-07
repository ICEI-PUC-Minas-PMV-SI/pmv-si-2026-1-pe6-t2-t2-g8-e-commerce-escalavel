package com.projeto6.OrderAPI.client;

import com.projeto6.OrderAPI.dto.PaymentRequest;
import com.projeto6.OrderAPI.dto.PaymentResponse;
import com.projeto6.OrderAPI.exception.PaymentDeclinedException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class PaymentClient {

    private final RestTemplate restTemplate;
    private final String paymentBaseUrl;

    public PaymentClient(RestTemplate restTemplate,
                         @Value("${payment.service.url}") String paymentBaseUrl) {
        this.restTemplate = restTemplate;
        this.paymentBaseUrl = paymentBaseUrl;
    }

    /**
     * Chama a PaymentAPI. Retorna a resposta em caso de aprovação (201).
     * Lança PaymentDeclinedException em caso de recusa (402).
     */
    public PaymentResponse process(UUID orderId, BigDecimal value) {
        String url = paymentBaseUrl + "/payments/process";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<PaymentRequest> entity = new HttpEntity<>(new PaymentRequest(orderId, value), headers);

        try {
            return restTemplate.postForObject(url, entity, PaymentResponse.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.PAYMENT_REQUIRED) {
                throw new PaymentDeclinedException(
                        "Pagamento recusado para o pedido " + orderId + ": " + e.getResponseBodyAsString());
            }
            throw e;
        }
    }
}
