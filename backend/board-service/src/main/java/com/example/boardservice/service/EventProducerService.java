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
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public EventProducerService(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public void sendProjectCreatedEvent(ProjectCreatedEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);

            MessageProperties props = new MessageProperties();
            // ✅ Исправлено: убрали массив, оставили только строку
            props.setHeader("MT-MessageType", "urn:message:Backend.Shared.DTOs:ProjectCreatedEvent");
            props.setContentType("application/json");
            props.setContentEncoding("UTF-8");
            props.setMessageId(UUID.randomUUID().toString());

            Message message = new Message(json.getBytes(StandardCharsets.UTF_8), props);
            rabbitTemplate.send("activity.exchange", "project.created", message);

            System.out.println("✅ Sent ProjectCreatedEvent: " + json);
        } catch (Exception e) {
            System.err.println("❌ Failed to send ProjectCreatedEvent: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public void sendProjectUpdatedEvent(ProjectUpdatedEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend("activity.exchange", "project.updated", json);
        } catch (Exception e) {
        }
    }

    public void sendProjectDeletedEvent(ProjectDeletedEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend("activity.exchange", "project.deleted", json);
        } catch (Exception e) {
        }
    }

    public void sendProjectMemberAddedEvent(ProjectMemberAddedEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend("activity.exchange", "project.member.added", json);
        } catch (Exception e) {
        }
    }

    public void sendProjectMemberRemovedEvent(ProjectMemberRemovedEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            rabbitTemplate.convertAndSend("activity.exchange", "project.member.removed", json);
        } catch (Exception e) {
        }
    }
}