package com.example.boardservice.service;

import com.example.boardservice.client.UserServiceClient;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.dto.response.CreateProjectResponse;
import com.example.boardservice.dto.response.GetProjectResponse;
import com.example.boardservice.dto.response.PublicProfileResponse;
import com.example.boardservice.exception.ProjectNotFoundException;
import com.example.boardservice.exception.ServiceAuthException;
import com.example.boardservice.exception.UserNotFoundException;
import com.example.boardservice.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectInviteService inviteService;
    private final ProjectMemberService memberService;
    private final ProjectRoleService roleService;
    private final AuthService authService;
    private final UserServiceClient userServiceClient;

    @Transactional
    public CreateProjectResponse createProject(Long ownerId, String name, String key) {
        Project project = Project.builder()
                .name(name)
                .key(key)
                .ownerId(ownerId)
                .inviteToken(inviteService.generateSecureToken())
                .build();
        project = projectRepository.save(project);

        ProjectRole ownerRole = roleService.createDefaultRoles(project.getId());

        memberService.addOwner(project, ownerId, ownerRole);

        return new CreateProjectResponse(project.getId(), project.getName(), project.getKey());
    }

    @Transactional
    public GetProjectResponse getProjectById(Long userId, Long projectId) {

        authService.checkPermission(userId, projectId, EntityType.PROJECT, ActionType.VIEW);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        return new GetProjectResponse(
                project.getId(),
                project.getOwnerId(),
                project.getName(),
                project.getKey(),
                project.getCreatedAt()
        );
    }
}
