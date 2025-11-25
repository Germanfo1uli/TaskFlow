package com.example.userservice.service;

import com.example.userservice.exception.InvalidFileException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Component
public class AvatarValidator {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_SIZE = 10 * 1024 * 1024;

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new InvalidFileException("File is required");
        if (file.getSize() > MAX_SIZE)
            throw new InvalidFileException("File size must be <= 10 MB");
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new InvalidFileException("Only JPG, PNG, WebP, Gif are allowed");
    }
}