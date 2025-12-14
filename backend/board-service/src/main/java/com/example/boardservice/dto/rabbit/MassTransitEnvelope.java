package com.example.boardservice.dto.rabbit;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MassTransitEnvelope {
    private String messageId;
    private String[] messageType;
    private String sourceAddress;
    private Map<String, Object> headers;
    private Object message;

    public static MassTransitEnvelope wrap(Object event, String eventTypeUrn) {
        return MassTransitEnvelope.builder()
                .messageId(UUID.randomUUID().toString())
                .messageType(new String[]{eventTypeUrn})
                .message(event)
                .build();
    }
}