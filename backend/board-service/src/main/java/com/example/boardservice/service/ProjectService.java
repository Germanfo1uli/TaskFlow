package com.example.boardservice.service;

import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.response.CreateProjectResponse;
import com.example.boardservice.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final RoleService roleService;

    @Transactional
    public CreateProjectResponse createProject(Long ownerId, String name, String key) {
        Project project = Project.builder()
                .name(name)
                .key(key)
                .ownerId(ownerId)
                .build();
        projectRepository.save(project);

        roleService.createDefaultRoles(project.getId());

        return new CreateProjectResponse(
                project.getName(),
                project.getKey()
        );
    };
}
