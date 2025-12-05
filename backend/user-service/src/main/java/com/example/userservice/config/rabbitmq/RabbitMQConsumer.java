package com.example.userservice.config.rabbitmq;

import com.example.userservice.config.rabbitmq.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQConsumer {

    @RabbitListener(queues = RabbitMQConfig.MY_QUEUE)
    public void receiveMessage(String message) {
        System.out.println("Received message: '" + message + "'");
    }
}
