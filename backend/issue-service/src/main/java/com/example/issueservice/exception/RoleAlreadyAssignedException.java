package com.example.issueservice.exception;

public class RoleAlreadyAssignedException extends RuntimeException {
    public RoleAlreadyAssignedException(String message) {
        super(message);
    }
}
