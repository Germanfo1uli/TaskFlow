package com.example.gateway.service;

import com.example.gateway.config.GatewayConfig;
import com.example.gateway.exception.InvalidTokenException;
import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenService {
    private final GatewayConfig config;

    public JwtClaims parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(config.jwtSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userid = claims.getSubject();
            String role = claims.get("role", String.class);
            String email = claims.get("email", String.class);

            if (userid == null || role == null) {
                throw new InvalidTokenException("Missing required claims");
            }

            return new JwtClaims(Long.parseLong(userid), role, email);
        } catch (JwtException e) {
            throw new InvalidTokenException("Invalid token", e);
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            SecretKey key = config.jwtSecretKey();
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claims.getExpiration().before(java.util.Date.from(Instant.now()));
        } catch (JwtException e) {
            return true;
        }
    }

    public record JwtClaims(Long userId, String role, String email) {}
}