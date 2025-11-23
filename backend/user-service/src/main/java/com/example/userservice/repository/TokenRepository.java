package com.example.userservice.repository;

import com.example.userservice.models.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByJti(UUID jti);
    List<RefreshToken> findAllByUser_IdAndRevokedFalse(Long userId);
}
