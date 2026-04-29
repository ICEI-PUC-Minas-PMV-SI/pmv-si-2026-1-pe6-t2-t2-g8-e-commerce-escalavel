package com.projeto6.OrderAPI.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Component
public class UserClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public UserClient(RestTemplate restTemplate,
                      @Value("${users.service.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public String fetchEmail(UUID userId) {
        try {
            Map<?, ?> resp = restTemplate.getForObject(baseUrl + "/users/" + userId, Map.class);
            if (resp != null && resp.get("email") != null) {
                return resp.get("email").toString();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
