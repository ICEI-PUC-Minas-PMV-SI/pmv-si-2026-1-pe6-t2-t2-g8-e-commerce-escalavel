package com.projeto6.OrderAPI.config;

import org.springframework.amqp.core.FanoutExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Bean
    public FanoutExchange paymentConfirmedExchange() {
        return new FanoutExchange("PaymentConfirmedEvent", true, false);
    }
}
