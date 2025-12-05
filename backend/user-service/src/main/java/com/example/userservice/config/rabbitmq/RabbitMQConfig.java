package com.example.userservice.config.rabbitmq;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String MY_QUEUE = "myQueue";

    @Bean
    public Queue queue() {
        return new Queue(MY_QUEUE, false);
    }
}
