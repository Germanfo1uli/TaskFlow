package com.example.gateway.security;

import com.example.gateway.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
@Slf4j
@RequiredArgsConstructor
public class TokenRevocationFilter implements GlobalFilter, Ordered {

    private final TokenBlacklistService blacklistService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().toString();

        boolean shouldRevoke = isRevocationEndpoint(path, method);

        if (!shouldRevoke) {
            return chain.filter(exchange);
        }

        String token = extractToken(exchange);
        if (token != null) {
            exchange.getAttributes().put("token-to-revoke", token);
        }

        return chain.filter(exchange)
                .then(Mono.defer(() -> {
                    if (exchange.getResponse().getStatusCode() == HttpStatus.OK) {
                        if (token != null) {
                            return blacklistService.blacklist(token, Duration.ofMinutes(15))
                                    .doOnSuccess(v -> log.debug("Token revoked: {}", token.hashCode()))
                                    .doOnError(e -> log.error("Failed to revoke token", e))
                                    .then();
                        }
                    }
                    return Mono.empty();
                }));
    }

    private boolean isRevocationEndpoint(String path, String method) {
        return  ("/api/auth/change-password".equals(path) && "PATCH".equals(method)) ||
                ("/api/auth/change-email".equals(path) && "PATCH".equals(method)) ||
                ("/api/auth/logout".equals(path) && "POST".equals(method)) ||
                ("/api/auth/account".equals(path) && "DELETE".equals(method));
    }

    private String extractToken(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}