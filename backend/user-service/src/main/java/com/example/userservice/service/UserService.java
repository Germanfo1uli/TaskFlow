package com.example.userservice.service;

import com.example.userservice.exception.*;
import com.example.userservice.dto.data.UserFlags;
import com.example.userservice.dto.response.ChangeProfileResponse;
import com.example.userservice.dto.response.MyProfileResponse;
import com.example.userservice.dto.response.PublicProfileResponse;
import com.example.userservice.dto.models.User;
import com.example.userservice.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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

    public List<PublicProfileResponse> getProfilesByIds(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<User> users = userRepository.findAllById(userIds);

        List<User> validUsers = users.stream()
                .filter(user -> user.getDeletedAt() == null)
                .filter(user -> user.getLockedAt() == null)
                .toList();

        int filteredOut = users.size() - validUsers.size();
        if (filteredOut > 0) {
            log.warn("Filtered out {} deleted/locked users from batch request", filteredOut);
        }

        return validUsers.stream()
                .map(PublicProfileResponse::fromUser)
                .collect(Collectors.toList());
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

        log.info("Query: {} was received. Search was started", query);

        String trimmed = query.trim();
        final List<User> foundUsers;

        log.info("Query: {} was trimmed: {}", query, trimmed);

        // поиск по тегу (10 совпадений)
        if (trimmed.startsWith("#")) {
            String tag = trimmed.substring(1);

            log.info("Started #tag search by: {}", tag);

            if (!tag.matches("\\d{4}")) {
                throw new InvalidQueryException("Tag must be exactly 4 digits");
            }
            foundUsers = userRepository
                    .findTop10ByTagAndDeletedAtIsNullAndLockedAtIsNull(tag);
        }
        // поиск по юзернейм#тег (точное совпадение)
        else if (trimmed.contains("#")) {
            String[] parts = trimmed.split("#", 2);
            String tag = parts[1];

            log.info("Started username#tag search by: {}#{}", parts[0], tag);

            if (!tag.matches("\\d{4}")) {
                throw new InvalidQueryException("Tag must be exactly 4 digits");
            }

            foundUsers = userRepository
                    .findByUsernameIgnoreCaseAndTagAndDeletedAtIsNullAndLockedAtIsNull(
                            parts[0], tag)
                    .map(List::of)
                    .orElseGet(List::of);
        }
        // поиск по юзернейму и его вхождениям
        else {
            log.info("Started username search by: {}", trimmed);

            foundUsers = userRepository
                    .findTop10ByUsernameContainingIgnoreCaseAndDeletedAtIsNullAndLockedAtIsNull(trimmed);
        }

        return foundUsers.stream()
                .map(PublicProfileResponse::fromUser)
                .collect(Collectors.toList());
    }
}
