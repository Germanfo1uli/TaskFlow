package com.example.userservice.service;

import com.example.userservice.exception.EmailAlreadyExistsException;
import com.example.userservice.exception.InvalidCredentialsException;
import com.example.userservice.exception.UserNotFoundException;
import com.example.userservice.models.dto.data.LoginData;
import com.example.userservice.models.dto.response.LoginResponse;
import com.example.userservice.models.dto.response.TokenResponse;
import com.example.userservice.models.entity.RefreshToken;
import com.example.userservice.models.entity.User;
import com.example.userservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ProfileService profileService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    @Async
    public CompletableFuture<LoginResponse> registerAsync(
            String email, String password, String deviceInfo) {

        User savedUser = createAndSaveUser(email, password);
        profileService.createProfile(savedUser);
        LoginResponse response = createLoginResponse(savedUser, deviceInfo);

        return CompletableFuture.completedFuture(response);
    }

    private User createAndSaveUser(String email, String password) {
        User user = new User();
        user.setEmail(email);
        user.setCreatedAt(LocalDateTime.now());
        user.setPasswordHash(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    @Async
    public CompletableFuture<LoginResponse> loginAsync(
            String email, String password, String deviceInfo) {

        return CompletableFuture.supplyAsync(() -> {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new InvalidCredentialsException("Неверный логин или пароль"));

            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                throw new InvalidCredentialsException("Неверный логин или пароль");
            }

            return createLoginResponse(user, deviceInfo);
        });
    }

    public LoginResponse createLoginResponse(User user, String deviceInfo) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, deviceInfo);
        jwtService.saveRefreshTokenAsync(user, refreshToken, deviceInfo);
        return new LoginResponse(user.getEmail(), accessToken, refreshToken);
    }

    @Async
    public CompletableFuture<TokenResponse> refreshTokenAsync(String refreshToken, String deviceInfo) {
        return CompletableFuture.supplyAsync(() ->
                        jwtService.validateRefreshToken(refreshToken)
                )
                .thenApply(RefreshToken::getUser)
                .thenCompose(user ->
                        jwtService.revokeTokenAsync(refreshToken)
                                .thenApply(ignored -> user)
                )
                .thenCompose(user -> {
                    String newAccess = jwtService.generateAccessToken(user);
                    String newRefresh = jwtService.generateRefreshToken(user, deviceInfo);

                    return jwtService.saveRefreshTokenAsync(user, newRefresh, deviceInfo)
                            .thenApply(saved -> new TokenResponse(newAccess, newRefresh));
                });
    }

    @Async
    public CompletableFuture<TokenResponse> changePasswordAsync(
            String oldPassword, String newPassword,
            Long userId, String refreshToken, String deviceInfo) {

        return CompletableFuture.supplyAsync(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));

            jwtService.validateRefreshToken(refreshToken);

            if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
                throw new InvalidCredentialsException("Неверный старый пароль");
            }
            if (oldPassword.equals(newPassword)) {
                throw new InvalidCredentialsException("Новый пароль должен отличаться");
            }

            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            String newAccess = jwtService.generateAccessToken(user);
            String newRefresh = jwtService.generateRefreshToken(user, deviceInfo);

            return new LoginData(user, newAccess, newRefresh);
        }).thenCompose(data ->
                jwtService.saveRefreshTokenAsync(data.user(), data.refreshToken(), deviceInfo)
                        .thenApply(saved -> data)
        ).thenCompose(data ->
                jwtService.revokeAllRefreshExcept(data.user().getId(), data.refreshToken())
                        .thenApply(ignored -> new TokenResponse(data.accessToken(), data.refreshToken()))
        );
    }

    @Async
    public CompletableFuture<TokenResponse> changeEmailAsync(
            String newEmail, String password,
            Long userId, String refreshToken, String deviceInfo) {

        return CompletableFuture.supplyAsync(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));

            jwtService.validateRefreshToken(refreshToken);

            if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                throw new InvalidCredentialsException("Неверный пароль");
            }

            if (newEmail.equals(user.getEmail())) {
                throw new InvalidCredentialsException("Почта совпадает со старой");
            }

            user.setEmail(newEmail);
            userRepository.save(user);

            String newAccess = jwtService.generateAccessToken(user);
            String newRefresh = jwtService.generateRefreshToken(user, deviceInfo);

            return new LoginData(user, newAccess, newRefresh);
        }).thenCompose(data ->
                jwtService.saveRefreshTokenAsync(data.user(), data.refreshToken(), deviceInfo)
                        .thenApply(saved -> data)
        ).thenCompose(data ->
                jwtService.revokeAllRefreshExcept(data.user().getId(), data.refreshToken())
                        .thenApply(ignored -> new TokenResponse(data.accessToken(), data.refreshToken()))
        );
    }
}
