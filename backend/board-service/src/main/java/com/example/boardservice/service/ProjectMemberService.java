package com.example.boardservice.service;

import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectMember;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.exception.AlreadyMemberException;
import com.example.boardservice.exception.RoleNotFoundException;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {
    private final ProjectMemberRepository memberRepository;
    private final ProjectRoleRepository roleRepository;

    @Transactional
    public ProjectMember addMember(Long userId, Long projectId, Long roleId) {
        if (memberRepository.existsByProject_IdAndUserId(projectId, userId)) {
            throw new AlreadyMemberException("You are already a project member");
        }

        Project project = Project.builder().id(projectId).build();
        ProjectRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role with ID: " + roleId + "not found"));

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .userId(userId)
                .role(role)
                .build();

        return memberRepository.save(member);
    }

    @Transactional
    public ProjectMember addOwner(Project project, Long ownerId, ProjectRole ownerRole) {
        return addMember(project.getId(), ownerId, ownerRole.getId());
    }
}
