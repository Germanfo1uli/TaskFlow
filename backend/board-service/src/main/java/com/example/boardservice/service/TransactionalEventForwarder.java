package com.example.boardservice.service;

import com.example.boardservice.dto.rabbit.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionalEventForwarder {

    private final EventProducerService producer;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleProjectCreated(ProjectCreatedEvent event) {
        producer.sendProjectCreatedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleProjectUpdated(ProjectUpdatedEvent event) {
        producer.sendProjectUpdatedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleProjectDeleted(ProjectDeletedEvent event) {
        producer.sendProjectDeletedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMemberAdded(ProjectMemberAddedEvent event) {
        producer.sendProjectMemberAddedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMemberRemoved(ProjectMemberRemovedEvent event) {
        producer.sendProjectMemberRemovedEvent(event);
    }
}