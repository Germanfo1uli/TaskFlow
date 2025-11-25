package com.example.userservice.service;

import com.example.userservice.exception.*;
import com.example.userservice.models.dto.response.TokenPair;
import com.example.userservice.models.dto.response.LoginResponse;
import com.example.userservice.models.entity.RefreshToken;
import com.example.userservice.models.entity.SystemRole;
import com.example.userservice.models.entity.User;
import com.example.userservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserService userService;

    @Transactional
    public LoginResponse register(String name, String email, String password, String deviceInfo) {

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email already in use");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .systemRole(SystemRole.USER)
                .build();
        userRepository.save(user);

        userService.createProfile(user, name);

        TokenPair pair = tokenService.createTokenPair(user, deviceInfo);
        return new LoginResponse(user.getEmail(), pair.accessToken(), pair.refreshToken());
    }

    public LoginResponse login(String email, String password, String deviceInfo) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Incorrect login or password"));

        if (user.getDeletedAt() != null) {
            throw new AccountDeletedException();
        }

        if (user.getLockedAt() != null) {
            throw new AccountLockedException();
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Incorrect login or password");
        }

        TokenPair pair = tokenService.createTokenPair(user, deviceInfo);
        return new LoginResponse(user.getEmail(), pair.accessToken(), pair.refreshToken());
    }

    public TokenPair refresh(String refreshTokenString, String deviceFingerprint) {
        RefreshToken current = tokenService.validateRefreshToken(refreshTokenString);

        if (!current.getDeviceFingerprint().equals(deviceFingerprint)) {
            log.warn("Device mismatch: jti: {}, userId: {}",
                    current.getJti(), current.getUser().getId());

            tokenService.revokeAllByUser(current.getUser().getId());

            throw new DeviceMismatchException();
        }

        User user = current.getUser();
        tokenService.revokeByString(refreshTokenString);

        if (user.getDeletedAt() != null) {
            throw new AccountDeletedException();
        }

        if (user.getLockedAt() != null) {
            throw new AccountLockedException();
        }

        return tokenService.createTokenPair(user, deviceFingerprint);
    }

    public void logout(String refreshTokenString) {
        tokenService.revokeByString(refreshTokenString);
    }

    @Transactional
    public TokenPair changePassword(Long userId, String oldPassword, String newPassword,
                                        String currentRefresh, String deviceInfo) {

        tokenService.validateRefreshToken(currentRefresh);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Incorrect password");
        }
        if (oldPassword.equals(newPassword)) {
            throw new InvalidCredentialsException("Password must be different");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));

        tokenService.revokeAllExcept(userId, currentRefresh);
        return tokenService.createTokenPair(user, deviceInfo);
    }

    @Transactional
    public TokenPair changeEmail(Long userId, String newEmail, String password,
                                     String currentRefresh, String deviceInfo) {

        tokenService.validateRefreshToken(currentRefresh);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Incorrect password");
        }

        if (newEmail.equals(user.getEmail())) {
            throw new InvalidCredentialsException("Email must be different");
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new EmailAlreadyExistsException("Email already in use");
        }

        user.setEmail(newEmail);

        tokenService.revokeAllExcept(userId, currentRefresh);
        return tokenService.createTokenPair(user, deviceInfo);
    }

    @Transactional
    public void deleteAccount(Long userId, String password) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Incorrect login or password");
        }

        user.setDeletedAt(LocalDateTime.now());

        tokenService.revokeAllByUser(userId);
    }
}