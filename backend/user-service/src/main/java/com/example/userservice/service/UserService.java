package com.example.userservice.service;

import com.example.userservice.exception.AccountDeletedException;
import com.example.userservice.exception.AccountLockedException;
import com.example.userservice.exception.UserNotFoundException;
import com.example.userservice.exception.UsernameTagExhaustedException;
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
}
