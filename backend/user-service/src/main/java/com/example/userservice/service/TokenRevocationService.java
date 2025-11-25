package com.example.userservice.service;

import com.example.userservice.models.entity.RefreshToken;
import com.example.userservice.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenRevocationService {
    private final TokenRepository tokenRepository;
    private final JwtHelper jwtHelper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void revokeAllByUser(Long userId) {
        List<RefreshToken> active = tokenRepository.findAllByUser_IdAndRevokedFalse(userId);
        active.forEach(t -> t.setRevoked(true));
        tokenRepository.saveAll(active);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void revokeAllExcept(Long userId, String newToken) {
        UUID newJti = UUID.fromString(jwtHelper.parseToken(newToken).getId());
        List<RefreshToken> active = tokenRepository.findAllByUser_IdAndRevokedFalse(userId);
        active.stream()
                .filter(t -> !t.getJti().equals(newJti))
                .forEach(t -> t.setRevoked(true));
        tokenRepository.saveAll(active);
    }
}
