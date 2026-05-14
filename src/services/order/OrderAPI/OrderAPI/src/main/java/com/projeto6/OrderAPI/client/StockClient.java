package com.projeto6.OrderAPI.client;

import com.projeto6.OrderAPI.dto.StockOpRequest;
import com.projeto6.OrderAPI.exception.InsufficientStockException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Component
public class StockClient {

    private final RestTemplate restTemplate;
    private final String stockBaseUrl;

    public StockClient(RestTemplate restTemplate,
                       @Value("${stock.service.url}") String stockBaseUrl) {
        this.restTemplate = restTemplate;
        this.stockBaseUrl = stockBaseUrl;
    }

    public void reserve(UUID skuId, UUID orderId, int quantity) {
        try {
            exchange("reserve", skuId, orderId, quantity);
        } catch (HttpClientErrorException e) {
            throw new InsufficientStockException(
                    "Stock reservation failed for SKU " + skuId + ": " + e.getResponseBodyAsString(), e);
        }
    }

    public void release(UUID skuId, UUID orderId, int quantity) {
        exchange("release", skuId, orderId, quantity);
    }

    public void confirm(UUID skuId, UUID orderId, int quantity) {
        exchange("confirm", skuId, orderId, quantity);
    }

    private void exchange(String op, UUID skuId, UUID orderId, int quantity) {
        String url = stockBaseUrl + "/stock/" + skuId + "/" + op + "/" + orderId;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<StockOpRequest> entity = new HttpEntity<>(new StockOpRequest(quantity), headers);
        restTemplate.exchange(url, HttpMethod.PUT, entity, Void.class);
    }
}
