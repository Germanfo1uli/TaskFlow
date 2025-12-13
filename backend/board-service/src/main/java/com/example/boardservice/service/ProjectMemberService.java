package com.example.boardservice.service;

import com.example.boardservice.cache.RedisCacheService;
import com.example.boardservice.client.UserServiceClient;
import com.example.boardservice.dto.data.UserBatchRequest;
import com.example.boardservice.dto.models.Project;
import com.example.boardservice.dto.models.ProjectMember;
import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import com.example.boardservice.dto.response.MemberExistResponse;
import com.example.boardservice.dto.response.ProjectMemberResponse;
import com.example.boardservice.dto.response.PublicProfileResponse;
import com.example.boardservice.exception.*;
import com.example.boardservice.repository.ProjectMemberRepository;
import com.example.boardservice.repository.ProjectRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectMemberService {
    private final ProjectMemberRepository memberRepository;
    private final ProjectRoleRepository roleRepository;
    private final UserServiceClient userClient;
    private final AuthService authService;
    private final RedisCacheService redisCacheService;

    @Transactional
    public ProjectMember addMember(Long userId, Long projectId, Long roleId) {

        try {
            userClient.getProfileById(userId);
        } catch (Exception e) {
            throw new InvalidInviteException("User with ID " + userId + " does not exist");
        }

        if (memberRepository.existsByProject_IdAndUserId(projectId, userId)) {
            throw new AlreadyMemberException("You are already a project member");
        }

        Project project = Project.builder().id(projectId).build();
        ProjectRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RoleNotFoundException("Role with ID: " + roleId + "not found"));

        if(!Objects.equals(role.getProject().getId(), projectId)) {
            throw new RoleNotInProjectException("Role with ID: " + roleId + " not found in project ID: " + projectId);
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .userId(userId)
                .role(role)
                .build();

        return memberRepository.save(member);
    }

    @Transactional
    public ProjectMember addDefaultMember(Long userId, Long projectId) {
        if (memberRepository.existsByProject_IdAndUserId(projectId, userId)) {
            throw new AlreadyMemberException("You are already a project member");
        }

        try {
            userClient.getProfileById(userId);
        } catch (Exception e) {
            throw new InvalidInviteException("User with ID " + userId + " does not exist");
        }

        Project project = Project.builder().id(projectId).build();
        ProjectRole role = roleRepository.findByProject_IdAndIsDefaultTrue(projectId)
                .orElseThrow(() -> new RoleNotFoundException("Default role not found"));

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .userId(userId)
                .role(role)
                .build();

        return memberRepository.save(member);
    }

    @Transactional
    public ProjectMember addOwner(Long ownerId, Project project, ProjectRole ownerRole) {
        return addMember(ownerId, project.getId(), ownerRole.getId());
    }

    public List<ProjectMemberResponse> getProjectMembersWithProfiles(Long userId, Long projectId) {

        authService.checkPermission(userId, projectId, EntityType.PROJECT, ActionType.VIEW);

        List<ProjectMember> members = memberRepository.findByProjectId(projectId);
        if (members.isEmpty()) {
            log.debug("No members found for project {}", projectId);
            return List.of();
        }

        Set<Long> userIds = members.stream()
                .map(ProjectMember::getUserId)
                .collect(Collectors.toSet());

        Map<Long, PublicProfileResponse> profileMap = getUserProfilesBatch(userIds);

        return members.stream()
                .map(member -> {
                    PublicProfileResponse profile = profileMap.get(member.getUserId());
                    if (profile == null) {
                        log.warn("Profile not found for userId {} in project {}", member.getUserId(), projectId);
                        return null;
                    }

                    return new ProjectMemberResponse(
                            member.getUserId(),
                            profile.username(),
                            profile.tag(),
                            profile.bio(),
                            member.getRole().getId(),
                            member.getRole().getName()
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public Map<Long, PublicProfileResponse> getUserProfilesBatch(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        log.info("Cache miss for user profiles: {}. Fetching from UserService...", userIds);

        try {
            UserBatchRequest request = new UserBatchRequest(new ArrayList<>(userIds));
            List<PublicProfileResponse> profiles = userClient.getProfilesByIds(request);

            return profiles.stream()
                    .collect(Collectors.toMap(PublicProfileResponse::id, p -> p));
        } catch (Exception e) {
            log.error("Failed to fetch profiles for users: {}", userIds, e);
            throw new ServiceUnavailableException("Failed to fetch user profiles" + e.getMessage());
        }
    }

    public MemberExistResponse getMemberInProject(Long userId, Long projectId) {
        ProjectMember member = memberRepository.findByUserIdAndProject_Id(userId, projectId)
                .orElseThrow(() -> new UserNotFoundException("User with ID: " + userId + " not found in project " + projectId));

        return new MemberExistResponse(
                member.getUserId(),
                member.getProject().getId()
        );
    }

    @Transactional
    public void kickProjectMember(Long userId, Long kickedId, Long projectId) {

        try {
            userClient.getProfileById(kickedId);
        } catch (Exception e) {
            throw new InvalidInviteException("User with ID " + kickedId + " does not exist");
        }

        if (!userId.equals(kickedId)) {
            authService.checkOwnerOnly(userId, projectId);
        }

        memberRepository.deleteByUserIdAndProject_Id(kickedId, projectId);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            redisCacheService.invalidateUserRole(kickedId, projectId);
                        } catch (Exception e) {
                            log.error("Failed to invalidate cache for user {} in project {}: {}",
                                    kickedId, projectId, e.getMessage());
                        }
                    }
                }
        );
    }
}
