package com.example.boardservice.service;

import com.example.boardservice.dto.models.Project;
import com.example.boardservice.repository.ProjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;

    @Transactional
    public Project createProject(String name, String key, Long ownerId) {
        Project project = Project.builder()
                .name(name)
                .key(key)
                .ownerId(ownerId)
                .build();
        projectRepository.save(project);
        return project;
    };
}
