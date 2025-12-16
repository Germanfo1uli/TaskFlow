package com.example.issueservice.services;

import com.example.issueservice.dto.rabbit.*;
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

    public void sendAttachmentCreatedEvent(AttachmentCreatedEvent event) {
        sendEvent(event, "project.created");
    }

    public void sendAttachmentDeletedEvent(AttachmentDeletedEvent event) {
        sendEvent(event, "project.deleted");
    }

    public void sendIssueCreatedEvent(IssueCreatedEvent event) {
        sendEvent(event, "issue.created");
    }

    public void sendIssueDeletedEvent(IssueDeletedEvent event) {
        sendEvent(event, "issue.deleted");
    }

    public void sendIssueUpdatedEvent(IssueUpdatedEvent event) {
        sendEvent(event, "issue.updated");
    }

    public void sendIssueStatusChangedEvent(IssueStatusChangedEvent event) {
        sendEvent(event, "issue.status.changed");
    }

    public void sendIssueAssigneeAddedEvent(IssueAssigneeAddedEvent event) {
        sendEvent(event, "issue.assignee.added");
    }

    public void sendIssueAssigneeRemovedEvent(IssueAssigneeRemovedEvent event) {
        sendEvent(event, "issue.assignee.removed");
    }

    public void sendIssueCommentCreatedEvent(IssueCommentCreatedEvent event) {
        sendEvent(event, "issue.comment.created");
    }

    public void sendIssueCommentDeletedEvent(IssueCommentDeletedEvent event) {
        sendEvent(event, "issue.comment.deleted");
    }

    public void sendIssueCommentUpdatedEvent(IssueCommentUpdatedEvent event) {
        sendEvent(event, "issue.comment.updated");
    }
}