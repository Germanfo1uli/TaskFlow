package com.example.userservice.service;

import com.example.userservice.config.JwtConfig;
import com.example.userservice.exception.InvalidRefreshTokenException;
import com.example.userservice.models.entity.RefreshToken;
import com.example.userservice.models.entity.User;
import com.example.userservice.repository.TokenRepository;
import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.sql.Ref;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final JwtConfig jwtConfig;
    private final TokenRepository tokenRepository;

    public String generateAccessToken(User user) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("User or user ID cannot be null");
        }

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtConfig.getAccessTokenExpiration()))
                .signWith(jwtConfig.getSecretKey())
                .compact();
    }

    public String generateRefreshToken(User user, String deviceInfo) {
        UUID jti = UUID.randomUUID();
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(jwtConfig.getRefreshTokenExpiration() / 1000);

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .setId(jti.toString())
                .claim("device", deviceInfo)
                .setIssuedAt(new Date())
                .setExpiration(Date.from(expiresAt.atZone(ZoneId.systemDefault()).toInstant()))
                .signWith(jwtConfig.getSecretKey())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(jwtConfig.getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public RefreshToken validateRefreshToken(String refreshToken) {
        Claims claims = parseToken(refreshToken);
        UUID jti = UUID.fromString(claims.getId());

        RefreshToken stored = tokenRepository.findByJti(jti)
                .orElseThrow(() -> new InvalidRefreshTokenException("Токен не найден"));

        if (stored.getRevoked()) {
            throw new InvalidRefreshTokenException("Токен отозван");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidRefreshTokenException("Токен истёк");
        }

        return stored;
    }

    public RefreshToken getTokenByString(String refreshToken) {
        Claims claims = parseToken(refreshToken);
        UUID jti = UUID.fromString(claims.getId());

        return tokenRepository.findByJti(jti)
                .orElseThrow(() -> new InvalidRefreshTokenException("Токен не найден"));
    }

    public CompletableFuture<RefreshToken> revokeTokenAsync(String refreshToken) {
        return CompletableFuture.supplyAsync(() -> {
            RefreshToken token = getTokenByString(refreshToken);
            token.setRevoked(true);
            return tokenRepository.save(token);
        });
    }

    public String extractEmail(String token) {
        return parseToken(token).get("email", String.class);
    }

    public Long extractUserId(String token) {
        return Long.valueOf(parseToken(token).getSubject());
    }

    public boolean isTokenExpired(String token) {
        try {
            return parseToken(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    @Async
    public CompletableFuture<RefreshToken> saveRefreshTokenAsync(
            User user, String rawToken, String deviceInfo) {

        return CompletableFuture.supplyAsync(() -> {
            Claims claims = parseToken(rawToken);
            UUID jti = UUID.fromString(claims.getId());
            LocalDateTime expiresAt = claims.getExpiration()
                    .toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();

            RefreshToken token = new RefreshToken();
            token.setUser(user);
            token.setJti(jti);
            token.setExpiresAt(expiresAt);
            token.setRevoked(false);
            token.setDeviceInfo(deviceInfo);

            return tokenRepository.save(token);
        });
    }

    @Async
    public CompletableFuture<Void> revokeAllRefreshExcept(Long userId, String newToken) {
        return CompletableFuture.runAsync(() -> {

            Claims newClaims = parseToken(newToken);
            UUID newJti = UUID.fromString(newClaims.getId());

            List<RefreshToken> activeTokens = tokenRepository.findAllByUserIdAndRevokedFalse(userId);

            activeTokens.removeIf(token -> token.getJti().equals(newJti));

            activeTokens.forEach(token -> token.setRevoked(true));
            tokenRepository.saveAll(activeTokens);
        });
    }
}
