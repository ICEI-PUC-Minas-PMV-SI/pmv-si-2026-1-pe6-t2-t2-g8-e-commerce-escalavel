package com.projeto6.OrderAPI.client;

import com.projeto6.OrderAPI.exception.PaymentDeclinedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
public class PaymentClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public PaymentClient(RestTemplate restTemplate,
                         @Value("${payment.service.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public PaymentResult process(UUID orderId, BigDecimal value) {
        String url = baseUrl + "/payments/process";
        Map<String, Object> body = Map.of("orderId", orderId.toString(), "value", value);
        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
            Map<?, ?> data = resp.getBody();
            String transactionId = data != null && data.get("transactionId") != null
                    ? data.get("transactionId").toString() : null;
            return new PaymentResult(true, transactionId, "APPROVED");
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 402) {
                throw new PaymentDeclinedException("Pagamento recusado: " + e.getResponseBodyAsString());
            }
            throw new RestClientException("Payment erro " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        }
    }

    public record PaymentResult(boolean approved, String transactionId, String status) {
    }
}
