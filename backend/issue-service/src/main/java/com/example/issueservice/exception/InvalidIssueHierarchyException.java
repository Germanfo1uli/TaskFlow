package com.example.issueservice.exception;

public class InvalidIssueHierarchyException extends RuntimeException {
    public InvalidIssueHierarchyException(String message) {
        super(message);
    }
}
