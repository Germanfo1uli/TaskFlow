package com.example.issueservice.exception;

public class ProjectTagNotFoundException extends RuntimeException {
    public ProjectTagNotFoundException(String message) {
        super(message);
    }
}
