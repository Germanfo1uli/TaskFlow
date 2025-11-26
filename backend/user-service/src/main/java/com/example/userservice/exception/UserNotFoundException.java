package com.example.userservice.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long userId) {
        super("User with ID: " + userId + " not found");;
    }

    public UserNotFoundException(String username, String tag) {
        super("User " + username + "#" + tag + " not found");;
    }

    public UserNotFoundException() {
        super("Users not found");
    }
}
