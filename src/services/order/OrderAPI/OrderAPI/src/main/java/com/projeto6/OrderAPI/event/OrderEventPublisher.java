package com.projeto6.OrderAPI.event;

import com.projeto6.OrderAPI.config.RabbitConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public OrderEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(OrderEvent event) {
        rabbitTemplate.convertAndSend(RabbitConfig.NOTIFICATIONS_QUEUE, event);
    }
}
