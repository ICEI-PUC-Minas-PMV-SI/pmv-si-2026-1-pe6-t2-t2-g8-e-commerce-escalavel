package com.projeto6.OrderAPI.client;

import com.projeto6.OrderAPI.exception.StockUnavailableException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Component
public class StockClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public StockClient(RestTemplate restTemplate,
                       @Value("${stock.service.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public void reserve(UUID productId, UUID orderId, int quantity) {
        call("reserve", productId, orderId, quantity, true);
    }

    public void release(UUID productId, UUID orderId, int quantity) {
        call("release", productId, orderId, quantity, false);
    }

    public void confirm(UUID productId, UUID orderId, int quantity) {
        call("confirm", productId, orderId, quantity, false);
    }

    private void call(String action, UUID productId, UUID orderId, int quantity, boolean failOnUnavailable) {
        String url = String.format("%s/stock/%s/%s/%s", baseUrl, productId, action, orderId);
        Map<String, Object> body = Map.of("quantity", quantity);
        try {
            ResponseEntity<Void> resp = restTemplate.exchange(
                    url, org.springframework.http.HttpMethod.PUT,
                    new org.springframework.http.HttpEntity<>(body), Void.class);
            if (!resp.getStatusCode().is2xxSuccessful()) {
                throw new RestClientException("Stock " + action + " failed: " + resp.getStatusCode());
            }
        } catch (HttpClientErrorException e) {
            HttpStatusCode status = e.getStatusCode();
            if (failOnUnavailable && status.value() == 422) {
                throw new StockUnavailableException(
                        "Produto " + productId + " indisponível: " + e.getResponseBodyAsString());
            }
            throw new RestClientException("Stock " + action + " erro " + status + ": " + e.getResponseBodyAsString());
        }
    }
}
