package com.projeto6.OrderAPI.client;

import com.projeto6.OrderAPI.dto.SkuResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Component
public class CatalogClient {

    private final RestTemplate restTemplate;
    private final String catalogBaseUrl;

    public CatalogClient(RestTemplate restTemplate,
                         @Value("${catalog.service.url}") String catalogBaseUrl) {
        this.restTemplate = restTemplate;
        this.catalogBaseUrl = catalogBaseUrl;
    }

    public SkuResponse findSkuById(UUID skuId) {
        String url = catalogBaseUrl + "/skus/" + skuId;
        return restTemplate.getForObject(url, SkuResponse.class);
    }
}
