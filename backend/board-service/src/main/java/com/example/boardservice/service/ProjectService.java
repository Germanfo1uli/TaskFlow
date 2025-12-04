package com.example.boardservice.service;

import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectMember;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.response.CreateProjectResponse;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectInviteService inviteService;
    private final ProjectMemberRepository memberRepository;
    private final RoleService roleService;

    @Transactional
    public CreateProjectResponse createProject(Long ownerId, String name, String key) {
        Project project = Project.builder()
                .name(name)
                .key(key)
                .ownerId(ownerId)
                .inviteToken(inviteService.generateSecureToken())
                .build();
        projectRepository.save(project);

        ProjectRole ownerRole = roleService.createDefaultRoles(project.getId());

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .userId(ownerId)
                .role(ownerRole)
                .build();
        memberRepository.save(member);

        return new CreateProjectResponse(
                project.getName(),
                project.getKey()
        );
    };

    @Transactional
    public Project getProjectById() {
        return new Project();
    }
}
