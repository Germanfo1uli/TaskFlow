package com.example.boardservice.exception;

public class ServiceAuthException extends RuntimeException {
    public ServiceAuthException(String message) {
        super(message);
    }
}
