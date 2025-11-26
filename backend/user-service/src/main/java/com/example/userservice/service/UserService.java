package com.example.userservice.service;

import com.example.userservice.exception.*;
import com.example.userservice.models.dto.data.UserFlags;
import com.example.userservice.models.dto.response.ChangeProfileResponse;
import com.example.userservice.models.dto.response.MyProfileResponse;
import com.example.userservice.models.dto.response.PublicProfileResponse;
import com.example.userservice.models.entity.User;
import com.example.userservice.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public ChangeProfileResponse updateProfileById(Long userId, String username, String bio) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (username != null && !username.equals(user.getUsername())) {
            String tag = generateUniqueTag(username);
            user.setTag(tag);
        }

        user.setBio(bio);
        user.setUsername(username);
        return new ChangeProfileResponse(user.getUsername(), user.getTag(), user.getBio());
    }

    public MyProfileResponse getMyProfile(Long userId) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));

            return new MyProfileResponse(
                    userId,
                    user.getEmail(),
                    user.getUsername(),
                    user.getTag(),
                    user.getBio(),
                    user.getCreatedAt()
            );
    }

    public PublicProfileResponse getProfileById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (user.getDeletedAt() != null) {
            throw new AccountDeletedException();
        }

        if (user.getLockedAt() != null) {
            throw new AccountLockedException();
        }

        return new PublicProfileResponse(
                userId,
                user.getUsername(),
                user.getTag(),
                user.getBio(),
                user.getCreatedAt()
        );
    }

    @Transactional(readOnly = true) // метод для генерации уникального username + tag (10 попыток)
    public String generateUniqueTag(String username) {
        for (int attempt = 0; attempt < 10; attempt++) {
            String tag = String.format("%04d", random.nextInt(10000));

            boolean exists = userRepository.existsByUsernameAndTag(username, tag);
            if (!exists) {
                return tag;
            }
        }

        throw new UsernameTagExhaustedException(
                "No available tags for username " + username + ". Please choose another username."
        );
    }

    public boolean isLocked(Long userId) {
        return userRepository.findFlagsById(userId)
                .map(UserFlags::isLocked)
                .orElse(false);
    }

    public boolean isDeleted(Long userId) {
        return userRepository.findFlagsById(userId)
                .map(UserFlags::isDeleted)
                .orElse(true);
    }

    @Transactional(readOnly = true)
    public List<PublicProfileResponse> searchUsers(String query) {
        if (query == null || query.isBlank()) {
            throw new InvalidQueryException("Query cannot be empty");
        }

        String trimmed = query.trim().toLowerCase();
        final List<User> foundUsers;

        // точный поиск username#tag
        if (trimmed.contains("#")) {
            String[] parts = trimmed.split("#", 2);
            String tag = parts[1];

            if (!tag.matches("\\d{4}")) {
                throw new InvalidQueryException("Tag must be exactly 4 digits");
            }

            // Для точного поиска достаточно findFirst
            foundUsers = userRepository.findByUsernameAndTag(parts[0], tag)
                    .map(List::of)
                    .orElseGet(List::of);
        }
        // поиск по тегу (до 10 записей бд)
        else if (trimmed.startsWith("#")) {
            String tag = trimmed.substring(1);
            if (!tag.matches("\\d{4}")) {
                throw new InvalidQueryException("Tag must be exactly 4 digits");
            }
            foundUsers = userRepository.findTop10ByTagAndDeletedAtIsNullAndLockedAtIsNull(tag);
        }
        // поиск по юзернейму (до 10 записей бд)
        else {
            foundUsers = userRepository.findTop10ByUsernameAndDeletedAtIsNullAndLockedAtIsNull(trimmed);
        }

        return foundUsers.stream()
                .map(PublicProfileResponse::fromUser)
                .collect(Collectors.toList());
    }
}
