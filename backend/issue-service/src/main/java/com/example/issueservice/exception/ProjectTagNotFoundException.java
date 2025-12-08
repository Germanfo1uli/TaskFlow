package com.example.issueservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ProjectTagNotFoundException extends RuntimeException {
    public ProjectTagNotFoundException(String message) {
        super(message);
    }
}
