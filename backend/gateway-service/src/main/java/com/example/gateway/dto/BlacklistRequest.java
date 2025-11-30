package com.example.gateway.dto;

public record BlacklistRequest(
        String token,
        long ttl
) {}