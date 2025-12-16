package com.example.boardservice.service;

import com.example.boardservice.cache.RedisCacheService;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectMember;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.dto.rabbit.ProjectCreatedEvent;
import com.example.boardservice.dto.rabbit.ProjectDeletedEvent;
import com.example.boardservice.dto.rabbit.ProjectUpdatedEvent;
import com.example.boardservice.dto.response.CreateProjectResponse;
import com.example.boardservice.dto.response.GetProjectResponse;
import com.example.boardservice.dto.response.InternalProjectResponse;
import com.example.boardservice.dto.response.ProjectListItem;
import com.example.boardservice.exception.AccessDeniedException;
import com.example.boardservice.exception.ProjectNotFoundException;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRepository;
import com.example.boardservice.repository.ProjectRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectInviteService inviteService;
    private final ProjectMemberService memberService;
    private final ProjectMemberRepository memberRepository;
    private final ProjectRoleRepository roleRepository;
    private final ProjectRoleService roleService;
    private final AuthService authService;
    private final RedisCacheService redisCacheService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CreateProjectResponse createProject(Long ownerId, String name, String description) {
        Project project = Project.builder()
                .name(name)
                .ownerId(ownerId)
                .description(description)
                .inviteToken(inviteService.generateSecureToken())
                .build();
        project = projectRepository.save(project);

        ProjectRole ownerRole = roleService.createDefaultRoles(project.getId());

        memberService.addOwner(ownerId, project, ownerRole);

        eventPublisher.publishEvent(
                ProjectCreatedEvent.fromProject(project, ownerId)
        );

        return new CreateProjectResponse(project.getId(), project.getName());
    }

    public List<ProjectListItem> getUserProjects(Long userId) {
        List<ProjectMember> memberships = memberRepository.findAllByUserId(userId);

        return memberships.stream()
                .filter(m -> m.getProject().getDeletedAt() == null)
                .map(m -> new ProjectListItem(
                        m.getProject().getId(),
                        m.getProject().getName(),
                        m.getProject().getDescription(),
                        m.getRole().getName(),
                        memberRepository.countByProjectId(m.getProject().getId())
                ))
                .collect(Collectors.toList());
    }

    public GetProjectResponse getProjectDetail(Long userId, Long projectId) {

        authService.checkPermission(userId, projectId, EntityType.PROJECT, ActionType.VIEW);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (project.getDeletedAt() != null) {
            throw new ProjectNotFoundException(projectId);
        }

        ProjectMember user = memberRepository.findByUserIdAndProject_Id(userId, projectId)
                .orElseThrow(() -> new AccessDeniedException("User with ID: " + userId + " not found in project ID: " + projectId));

        return new GetProjectResponse(
                projectId,
                project.getOwnerId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt(),
                user.getRole().getName()
        );
    }

    public InternalProjectResponse getProjectInternal(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (project.getDeletedAt() != null) {
            throw new ProjectNotFoundException(projectId);
        }

        return new InternalProjectResponse(
                projectId,
                project.getOwnerId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt()
        );
    }

    @Transactional
    public GetProjectResponse updateProject(Long userId, Long projectId, String name, String description) {

        authService.checkOwnerOnly(userId, projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (project.getDeletedAt() != null) {
            throw new ProjectNotFoundException(projectId);
        }

        project.setName(name);
        project.setDescription(description);

        ProjectMember user = memberRepository.findByUserIdAndProject_Id(userId, projectId)
                .orElseThrow(() -> new AccessDeniedException("User with ID: " + userId + " not found in project ID: " + projectId));

        eventPublisher.publishEvent(
                ProjectUpdatedEvent.fromProject(project, userId)
        );

        return new GetProjectResponse(
                projectId,
                project.getOwnerId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt(),
                user.getRole().getName()
        );
    }

    @Transactional
    public void deleteProject(Long userId, Long projectId) {
        authService.checkOwnerOnly(userId, projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (project.getDeletedAt() != null) {
            log.warn("Project {} already deleted", projectId);
            return;
        }

        eventPublisher.publishEvent(
                ProjectDeletedEvent.fromProject(project)
        );

        project.setDeletedAt(LocalDateTime.now());
        projectRepository.save(project);

        List<Long> roleIds = roleRepository.findRoleIdsByProjectId(projectId);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            redisCacheService.invalidateAllUsersInProject(projectId);

                            redisCacheService.invalidateAllRolesInProject(roleIds);

                            log.info("Successfully invalidated all caches for deleted project {}", projectId);
                        } catch (Exception e) {
                            log.error("Failed to invalidate cache for project {}: {}",
                                    projectId, e.getMessage(), e);
                        }
                    }
                }
        );
    }
}
