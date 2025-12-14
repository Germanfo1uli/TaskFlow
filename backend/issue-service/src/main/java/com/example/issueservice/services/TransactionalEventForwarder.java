package com.example.issueservice.services;

import com.example.issueservice.dto.rabbit.AttachmentCreatedEvent;
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
}