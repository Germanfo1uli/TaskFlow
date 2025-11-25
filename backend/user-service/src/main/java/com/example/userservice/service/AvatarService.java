package com.example.userservice.service;

import com.example.userservice.exception.InvalidFileException;
import com.example.userservice.exception.UserNotFoundException;
import com.example.userservice.models.entity.Avatar;
import com.example.userservice.models.entity.User;
import com.example.userservice.repository.AvatarRepository;
import com.example.userservice.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvatarService {
    private final AvatarRepository avatarRepository;
    private final UserRepository userRepository;

    @Transactional
    public void uploadAvatar(Long userId, MultipartFile file) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        avatarRepository.findByUserId(userId).ifPresent(avatarRepository::delete);

        String ext = getExtension(Objects.requireNonNull(file.getOriginalFilename()));
        String uniqueName = "avatar_" + userId + "_" + UUID.randomUUID() + "." + ext;

        Avatar avatar = Avatar.builder()
                .user(user)
                .mimeType(file.getContentType())
                .fileSize((int) file.getSize())
                .filename(uniqueName)
                .build();

        try {
            avatar.setData(file.getBytes());
        } catch (IOException e) {
            throw new InvalidFileException(e.getMessage());
        }

        avatarRepository.save(avatar);
    }

    private String getExtension(String originalName) {
        return originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
    }

    public Optional<Avatar> findByUserId(Long userId) {
        return avatarRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setAvatar(null);
        userRepository.save(user);
    }
}
