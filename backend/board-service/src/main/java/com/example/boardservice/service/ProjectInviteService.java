package com.example.boardservice.service;

import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.exception.InvalidInviteException;
import com.example.boardservice.exception.ProjectNotFoundException;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRepository;
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
    private final ProjectMemberRepository memberRepository;
    private final ProjectMemberService memberService;
    private final AuthService authService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Transactional
    public String regenerateInvite(Long projectId, Long userId) {

        authService.checkOwnerOnly(userId, projectId);

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

        memberService.addDefaultMember(userId, project.getId());

        return project.getId();
    }

    @Transactional
    public void inviteUser(Long userId, Long projectId, Long invitedUser, Long roleId) {

        authService.checkOwnerOnly(userId, projectId);

        if (!projectRepository.existsById(projectId)) {
            throw new InvalidInviteException("Project does not exists");
        }

        if (memberRepository.existsByProject_IdAndUserId(projectId, userId)) {
            throw new InvalidInviteException("User are already a project member");
        }

        memberService.addMember(invitedUser, projectId, roleId);
    }

    public String generateSecureToken() {
        byte[] randomBytes = new byte[16];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
