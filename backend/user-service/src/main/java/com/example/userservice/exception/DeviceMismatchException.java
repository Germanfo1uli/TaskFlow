package com.example.userservice.exception;

public class DeviceMismatchException extends RuntimeException {
    public DeviceMismatchException() {
        super("Device fingerprint mismatch. All tokens revoked");
    }
}
