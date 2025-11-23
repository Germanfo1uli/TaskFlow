package com.example.userservice.service;

import com.example.userservice.config.JwtConfig;
import com.example.userservice.exception.InvalidRefreshTokenException;
import com.example.userservice.models.dto.response.TokenPair;
import com.example.userservice.models.entity.RefreshToken;
import com.example.userservice.models.entity.User;
import com.example.userservice.repository.TokenRepository;
import io.jsonwebtoken.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final JwtConfig cfg;
    private final JwtHelper jwtHelper;
    private final TokenRepository tokenRepository;

    @Transactional
    public TokenPair createTokenPair(User user, String deviceInfo) {

        UUID jti = UUID.randomUUID();

        long refreshTtlMillis = cfg.getRefreshTokenExpiration();
        Date refreshExp = new Date(System.currentTimeMillis() + refreshTtlMillis);

        String access = jwtHelper.generateAccess(user);
        String refresh = jwtHelper.generateRefresh(user, jti, refreshExp, deviceInfo);

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .jti(jti)
                .expiresAt(refreshExp.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime())
                .deviceInfo(deviceInfo)
                .revoked(false)
                .build();
        tokenRepository.save(rt);

        return new TokenPair(access, refresh);
    }

    public RefreshToken validateRefreshToken(String refreshToken) {
        Claims claims = jwtHelper.parseToken(refreshToken);
        UUID jti = UUID.fromString(claims.getId());

        RefreshToken stored = tokenRepository.findByJti(jti)
                .orElseThrow(() -> new InvalidRefreshTokenException("Token not found"));

        if (stored.getRevoked()) {
            throw new InvalidRefreshTokenException("Token is revoked");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidRefreshTokenException("Token is expired");
        }

        return stored;
    }

    public RefreshToken getTokenByString(String refreshToken) {
        Claims claims = jwtHelper.parseToken(refreshToken);
        UUID jti = UUID.fromString(claims.getId());

        return tokenRepository.findByJti(jti)
                .orElseThrow(() -> new InvalidRefreshTokenException("Token not found"));
    }

    @Transactional
    public void revokeAllExcept(Long userId, String newToken) {
        UUID newJti = extractJti(newToken);
        List<RefreshToken> active = tokenRepository.findAllByUser_IdAndRevokedFalse(userId);
        active.stream()
                .filter(t -> !t.getJti().equals(newJti))
                .forEach(t -> t.setRevoked(true));
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
}
