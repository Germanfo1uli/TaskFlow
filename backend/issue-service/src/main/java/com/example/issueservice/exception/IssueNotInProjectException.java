package com.example.issueservice.exception;

public class IssueNotInProjectException extends RuntimeException {
    public IssueNotInProjectException(String message) {
        super(message);
    }
}
