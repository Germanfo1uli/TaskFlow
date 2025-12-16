package com.example.issueservice.services;

import com.example.issueservice.dto.rabbit.*;
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
    public void handleAttachmentCreated(AttachmentCreatedEvent event) {
        producer.sendAttachmentCreatedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAttachmentDeleted(AttachmentDeletedEvent event) {
        producer.sendAttachmentDeletedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueCreated(IssueCreatedEvent event) {
        producer.sendIssueCreatedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueDeleted(IssueDeletedEvent event) {
        producer.sendIssueDeletedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueUpdated(IssueUpdatedEvent event) {
        producer.sendIssueUpdatedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueStatusChanged(IssueStatusChangedEvent event) {
        producer.sendIssueStatusChangedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueAssigneeAdded(IssueAssigneeAddedEvent event) {
        producer.sendIssueAssigneeAddedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueAssigneeRemoved(IssueAssigneeRemovedEvent event) {
        producer.sendIssueAssigneeRemovedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueCommentCreated(IssueCommentCreatedEvent event) {
        producer.sendIssueCommentCreatedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueCommentDeleted(IssueCommentDeletedEvent event) {
        producer.sendIssueCommentDeletedEvent(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueCommentUpdated(IssueCommentUpdatedEvent event) {
        producer.sendIssueCommentUpdatedEvent(event);
    }
}