package com.example.userservice.service;

import com.example.userservice.config.JwtConfig;
import com.example.userservice.exception.DeviceMismatchException;
import com.example.userservice.exception.InvalidTokenException;
import com.example.userservice.models.dto.response.TokenPair;
import com.example.userservice.models.entity.RefreshToken;
import com.example.userservice.models.entity.User;
import com.example.userservice.repository.TokenRepository;
import io.jsonwebtoken.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {
    private final JwtConfig cfg;
    private final JwtHelper jwtHelper;
    private final TokenRevocationService revocationService;
    private final TokenRepository tokenRepository;

    @Transactional
    public TokenPair createTokenPair(User user, String deviceFingerprint) {

        UUID jti = UUID.randomUUID();

        long refreshTtlMillis = cfg.getRefreshTokenExpiration();
        Date refreshExp = new Date(System.currentTimeMillis() + refreshTtlMillis);

        String access = jwtHelper.generateAccess(user);
        String refresh = jwtHelper.generateRefresh(user, jti, refreshExp);

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .jti(jti)
                .expiresAt(refreshExp.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime())
                .deviceFingerprint(deviceFingerprint)
                .revoked(false)
                .build();
        tokenRepository.save(rt);

        return new TokenPair(access, refresh);
    }

    @Transactional
    public RefreshToken validateRefreshToken(String refreshToken, String deviceFingerprint) {
        Claims claims = jwtHelper.parseToken(refreshToken);
        UUID jti = UUID.fromString(claims.getId());

        RefreshToken stored = tokenRepository.findByJti(jti)
                .orElseThrow(() -> new InvalidTokenException("Token not found"));

        if (!stored.getDeviceFingerprint().equals(deviceFingerprint)) {
            log.warn("Device mismatch: jti: {}, userId: {}",
                    stored.getJti(), stored.getUser().getId());

            revocationService.revokeAllByUser(stored.getUser().getId());

            throw new DeviceMismatchException();
        }

        if (stored.getRevoked()) {
            throw new InvalidTokenException("Token is revoked");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Token is expired");
        }

        return stored;
    }

    public RefreshToken getTokenByString(String refreshToken) {
        Claims claims = jwtHelper.parseToken(refreshToken);
        UUID jti = UUID.fromString(claims.getId());

        return tokenRepository.findByJti(jti)
                .orElseThrow(() -> new InvalidTokenException("Token not found"));
    }

    @Transactional
    public void revokeByString(String refreshToken) {
        RefreshToken token = getTokenByString(refreshToken);
        token.setRevoked(true);
    }

    public Long extractUserId(String token) {
        return Long.valueOf(jwtHelper.parseToken(token).getSubject());
    }

    public UUID extractJti(String token) {
        return UUID.fromString(jwtHelper.parseToken(token).getId());
    }

    public String extractRole(String token) {
        return jwtHelper.parseToken(token).get("role", String.class);
    }
}
