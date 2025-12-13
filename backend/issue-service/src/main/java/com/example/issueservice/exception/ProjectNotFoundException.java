package com.example.issueservice.exception;

public class ProjectNotFoundException extends RuntimeException {
    public ProjectNotFoundException(Long projectId) {
        super("Project with id " + projectId + " not found");
    }
}