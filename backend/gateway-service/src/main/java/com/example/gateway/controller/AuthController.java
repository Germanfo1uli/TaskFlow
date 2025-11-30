package com.example.gateway.controller;

import com.example.gateway.dto.BlacklistRequest;
import com.example.gateway.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final TokenBlacklistService blacklistService;

    @Value("${gateway.secret.value:default-secret}")
    private String gatewaySecretValue;

    @PostMapping("/blacklist")
    public Mono<ResponseEntity<Void>> blacklistToken(
            @RequestHeader("X-Gateway-Source") String providedSecret,
            @RequestBody BlacklistRequest request) {

        if (!gatewaySecretValue.equals(providedSecret)) {
            log.warn("Invalid internal secret for blacklist endpoint");
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }

        return blacklistService.blacklist(request.token(), Duration.ofSeconds(request.ttl()))
                .then(Mono.just(ResponseEntity.ok().build()));
    }
}