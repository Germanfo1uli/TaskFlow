package com.example.userservice.service;

import com.example.userservice.cache.CacheConstants;
import com.example.userservice.dto.response.*;
import com.example.userservice.exception.*;
import com.example.userservice.dto.models.RefreshToken;
import com.example.userservice.dto.models.SystemRole;
import com.example.userservice.dto.models.User;
import com.example.userservice.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.transaction.annotation.Transactional;
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
    private final UserService userService;
    private final TokenService tokenService;
    private final TokenRevocationService revocationService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse register(String username, String email, String password, String deviceFingerprint) {

        if (!username.matches("^[a-zA-Z0-9]+$")) {
            throw new InvalidUsernameException("Invalid username format");
        }

        if (!password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{12,}$")) {
            throw new WeakPasswordException("Password does not meet requirements");
        }

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email already in use");
        }

        String tag = userService.generateUniqueTag(username);

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .username(username)
                .tag(tag)
                .systemRole(SystemRole.USER)
                .build();
        userRepository.save(user);

        TokenPair pair = tokenService.createTokenPair(user, deviceFingerprint);
        return new LoginResponse(
                user.getId(), user.getUsername(),
                user.getTag(), user.getEmail(), pair
        );
    }

    public LoginResponse login(String email, String password, String deviceFingerprint) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Incorrect login or password"));

        if (user.getDeletedAt() != null) {
            throw new AccountDeletedException();
        }

        if (user.getLockedAt() != null) {
            throw new AccountLockedException();
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthenticationException("Incorrect login or password");
        }

        TokenPair pair = tokenService.createTokenPair(user, deviceFingerprint);
        return new LoginResponse(
                user.getId(), user.getUsername(),
                user.getTag(), user.getEmail(), pair
        );
    }

    @Transactional
    public TokenPair refresh(String refreshTokenString, String deviceFingerprint) {

        RefreshToken current = tokenService.validateRefreshToken(refreshTokenString, deviceFingerprint);

        User user = current.getUser();

        if (user.getDeletedAt() != null) {
            throw new AccountDeletedException();
        }

        if (user.getLockedAt() != null) {
            throw new AccountLockedException();
        }

        tokenService.revokeByString(refreshTokenString);
        return tokenService.createTokenPair(user, deviceFingerprint);
    }

    public void logout(String refreshTokenString) {
        tokenService.revokeByString(refreshTokenString);
    }

    @Transactional
    public ChangePasswordResponse changePassword(Long userId, String oldPassword, String newPassword,
                                                 String currentRefresh, String deviceFingerprint) {

        if (!newPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{12,}$")) {
            throw new WeakPasswordException("Password does not meet requirements");
        }

        tokenService.validateRefreshToken(currentRefresh, deviceFingerprint);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new AuthenticationException("Incorrect password");
        }

        if (oldPassword.equals(newPassword)) {
            throw new AuthenticationException("Password must be different");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));

        revocationService.revokeAllByUser(userId);
        TokenPair pair = tokenService.createTokenPair(user, deviceFingerprint);
        return ChangePasswordResponse.of(userId, LocalDateTime.now(), pair);
    }

    @Transactional
    public ChangeEmailResponse changeEmail(Long userId, String newEmail, String password,
                                           String currentRefresh, String deviceFingerprint) {

        tokenService.validateRefreshToken(currentRefresh, deviceFingerprint);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthenticationException("Incorrect password");
        }

        if (newEmail.equals(user.getEmail())) {
            throw new AuthenticationException("Email must be different");
        }

        if (userRepository.existsByEmail(newEmail)) {
            throw new EmailAlreadyExistsException("Email already in use");
        }

        user.setEmail(newEmail);

        revocationService.revokeAllByUser(userId);
        TokenPair pair = tokenService.createTokenPair(user, deviceFingerprint);
        return ChangeEmailResponse.of(userId, LocalDateTime.now(), newEmail, pair);
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConstants.USER_PROFILE, key = "#userId"),
            @CacheEvict(value = CacheConstants.USER_PROFILE_BATCH, allEntries = true)
    })
    @Transactional
    public DeleteAccountResponse deleteAccount(Long userId, String password) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthenticationException("Incorrect login or password");
        }

        user.setDeletedAt(LocalDateTime.now());

        revocationService.revokeAllByUser(userId);
        return DeleteAccountResponse.of(userId, LocalDateTime.now());
    }
}