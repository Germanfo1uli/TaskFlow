package com.example.userservice.service;

import com.example.userservice.exception.UserNotFoundException;
import com.example.userservice.models.entity.Avatar;
import com.example.userservice.models.entity.User;
import com.example.userservice.repository.AvatarRepository;
import com.example.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AvatarService {
    private final AvatarRepository avatarRepository;
    private final UserRepository userRepository;

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 МБ
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    public Avatar uploadAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл пустой");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("Файл слишком большой (макс. 10 МБ)");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Недопустимый тип файла");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Avatar avatar = avatarRepository.findByUserId(userId)
                .orElse(new Avatar());

        try {
            avatar.setData(file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Ошибка чтения файла", e);
        }
        avatar.setMimeType(file.getContentType());
        avatar.setFileSize((int) file.getSize());
        avatar.setFilename(file.getOriginalFilename());
        avatar.setUser(user);

        return avatarRepository.save(avatar);
    }

    public Optional<Avatar> findByUserId(Long userId) {
        return avatarRepository.findByUserId(userId);
    }

    public void deleteAvatar(Long userId) {
        avatarRepository.deleteByUserId(userId);
    }
}
