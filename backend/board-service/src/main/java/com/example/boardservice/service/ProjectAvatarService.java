package com.example.boardservice.service;

import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectAvatar;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.dto.rabbit.ProjectCreatedEvent;
import com.example.boardservice.dto.rabbit.ProjectUpdatedEvent;
import com.example.boardservice.exception.InvalidFileException;
import com.example.boardservice.exception.ProjectNotFoundException;
import com.example.boardservice.repository.ProjectAvatarRepository;
import com.example.boardservice.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectAvatarService {
    private final ProjectAvatarRepository avatarRepository;
    private final ProjectRepository projectRepository;
    private final AuthService authService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void uploadAvatar(Long userId, Long projectId, MultipartFile file) {

        authService.checkOwnerOnly(userId, projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        ProjectAvatar avatar = avatarRepository.findByProjectId(projectId)
                .orElseGet(() -> ProjectAvatar.builder().project(project).build());

        String ext = getExtension(Objects.requireNonNull(file.getOriginalFilename()));
        String uniqueName = "avatar_" + projectId + "_" + UUID.randomUUID() + "." + ext;

        avatar.setMimeType(file.getContentType());
        avatar.setFileSize((int) file.getSize());
        avatar.setFilename(uniqueName);

        try {
            avatar.setData(file.getBytes());
        } catch (IOException e) {
            throw new InvalidFileException(e.getMessage());
        }

        avatarRepository.save(avatar);

        eventPublisher.publishEvent(
                ProjectUpdatedEvent.fromProject(project, userId)
        );
    }

    private String getExtension(String originalName) {
        return originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
    }

    public Optional<ProjectAvatar> findByProjectId(Long userId, Long projectId) {

        authService.checkPermission(userId, projectId, EntityType.PROJECT, ActionType.VIEW);

        return avatarRepository.findByProjectId(projectId);
    }

    @Transactional
    public void deleteAvatar(Long userId, Long projectId) {

        authService.checkOwnerOnly(userId, projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        project.setAvatar(null);
        projectRepository.save(project);

        eventPublisher.publishEvent(
                ProjectUpdatedEvent.fromProject(project, userId)
        );
    }
}
