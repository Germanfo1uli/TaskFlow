package com.example.userservice.config.rabbitmq;

import com.example.userservice.config.rabbitmq.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMessage(String message) {
        rabbitTemplate.convertAndSend("", RabbitMQConfig.MY_QUEUE, message);
        System.out.println("Sent message: '" + message + "'");
    }
}
