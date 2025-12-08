package com.example.issueservice.config;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public final class SecurityWhiteList {

    public static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**",
            "/actuator/health",
            "/actuator/info",
            "/v3/api-docs"
    );

    private SecurityWhiteList() {}
}