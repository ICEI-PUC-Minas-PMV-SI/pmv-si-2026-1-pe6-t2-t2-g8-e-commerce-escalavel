package com.projeto6.OrderAPI.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageBuilder;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);
    private static final String EXCHANGE = "PaymentConfirmedEvent";
    private static final String CONTENT_TYPE = "application/vnd.masstransit+json";

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public OrderEventPublisher(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishPaymentConfirmed(UUID orderId) {
        try {
            Map<String, Object> envelope = Map.of(
                "messageId", UUID.randomUUID().toString(),
                "messageType", List.of("urn:message:PaymentConfirmedEvent"),
                "message", Map.of("orderId", orderId.toString())
            );

            byte[] body = objectMapper.writeValueAsBytes(envelope);

            Message message = MessageBuilder
                .withBody(body)
                .setContentType(CONTENT_TYPE)
                .setContentEncoding("UTF-8")
                .build();

            rabbitTemplate.send(EXCHANGE, "", message);
            log.info("PaymentConfirmedEvent published for order {}", orderId);
        } catch (Exception ex) {
            log.error("Failed to publish PaymentConfirmedEvent for order {}: {}", orderId, ex.getMessage());
        }
    }
}
