package com.example.boardservice.exception;

public class AlreadyMemberException extends RuntimeException {
    public AlreadyMemberException(String message) {
        super(message);
    }
}
