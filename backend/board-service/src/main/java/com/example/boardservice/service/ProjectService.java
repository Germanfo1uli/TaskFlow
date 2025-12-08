package com.example.boardservice.service;

import com.example.boardservice.client.UserServiceClient;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectMember;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.dto.response.CreateProjectResponse;
import com.example.boardservice.dto.response.GetProjectResponse;
import com.example.boardservice.dto.response.ProjectListItem;
import com.example.boardservice.dto.response.PublicProfileResponse;
import com.example.boardservice.exception.ProjectNotFoundException;
import com.example.boardservice.exception.ServiceAuthException;
import com.example.boardservice.exception.UserNotFoundException;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ProjectRoleService roleService;

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

    public List<ProjectListItem> getUserProjects(Long userId) {
        List<ProjectMember> memberships = memberRepository.findByUserId(userId);

        return memberships.stream()
                .map(m -> new ProjectListItem(
                        m.getProject().getId(),
                        m.getProject().getName(),
                        m.getProject().getKey(),
                        m.getRole().getName(),
                        memberRepository.countByProjectId(m.getProject().getId())
                ))
                .collect(Collectors.toList());
    }

    public GetProjectResponse getProjectDetail(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        ProjectMember user = memberRepository.findByUserIdAndProject_Id(userId, projectId)
                .orElseThrow(() -> new UserNotFoundException("User with ID: " + userId + " not found in project ID: " + projectId));

        return new GetProjectResponse(
                projectId,
                project.getOwnerId(),
                project.getName(),
                project.getKey(),
                project.getCreatedAt(),
                user.getRole().getName()
        );
    }
}
