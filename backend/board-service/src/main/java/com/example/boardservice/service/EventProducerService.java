package com.example.boardservice.service;

import com.example.boardservice.dto.rabbit.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class EventProducerService {
    private static final String EXCHANGE_NAME = "activity.exchange";
    private static final String MESSAGE_TYPE_PREFIX = "urn:message:Backend.Shared.DTOs:";

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public EventProducerService(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    private void sendEvent(Object event, String routingKey) {
        try {
            String json = objectMapper.writeValueAsString(event);
            String className = event.getClass().getSimpleName();

            MessageProperties props = new MessageProperties();
            props.setHeader("MT-MessageType", MESSAGE_TYPE_PREFIX + className);
            props.setContentType("application/json");
            props.setContentEncoding("UTF-8");
            props.setMessageId(UUID.randomUUID().toString());

            Message message = new Message(json.getBytes(StandardCharsets.UTF_8), props);
            rabbitTemplate.send(EXCHANGE_NAME, routingKey, message);

            System.out.println("Sent " + className + ": " + json);
        } catch (Exception e) {
            System.err.println("Failed to send event: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public void sendProjectCreatedEvent(ProjectCreatedEvent event) {
        sendEvent(event, "project.created");
    }

    public void sendProjectUpdatedEvent(ProjectUpdatedEvent event) {
        sendEvent(event, "project.updated");
    }

    public void sendProjectDeletedEvent(ProjectDeletedEvent event) {
        sendEvent(event, "project.deleted");
    }

    public void sendProjectMemberAddedEvent(ProjectMemberAddedEvent event) {
        sendEvent(event, "project.member.added");
    }

    public void sendProjectMemberRemovedEvent(ProjectMemberRemovedEvent event) {
        sendEvent(event, "project.member.removed");
    }
}