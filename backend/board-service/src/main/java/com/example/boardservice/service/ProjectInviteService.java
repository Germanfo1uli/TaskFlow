package com.example.boardservice.service;

import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectMember;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.exception.InvalidInviteException;
import com.example.boardservice.exception.RoleNotFoundException;
import com.example.boardservice.exception.ProjectNotFoundException;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRepository;
import com.example.boardservice.repository.ProjectRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class ProjectInviteService {
    private final ProjectRepository projectRepository;
    private final ProjectRoleRepository roleRepository;
    private final ProjectMemberRepository memberRepository;
    private final ProjectMemberService memberService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Transactional
    public String regenerateInvite(Long projectId, Long userId) {

        // нужно проверить права

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        String newToken = generateSecureToken();
        String inviteLink = frontendUrl + "/join/" + newToken;

        project.setInviteToken(newToken);

        return inviteLink;
    }

    @Transactional
    public Long joinByInvite(String token, Long userId) {
        Project project = projectRepository.findByInviteToken(token)
                .orElseThrow(() -> new InvalidInviteException("Project does not exists"));

        if (memberRepository.existsByProject_IdAndUserId(project.getId(), userId)) {
            throw new InvalidInviteException("You are already a project member");
        }

        ProjectRole defaultRole = roleRepository.findByProject_IdAndIsDefaultTrue(project.getId())
                .orElseThrow(() -> new RoleNotFoundException("Project do not have a default role"));

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .userId(userId)
                .role(defaultRole)
                .build();
        memberRepository.save(member);

        return project.getId();
    }

    public String generateSecureToken() {
        byte[] randomBytes = new byte[16];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
