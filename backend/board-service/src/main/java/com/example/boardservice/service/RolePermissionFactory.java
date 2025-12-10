package com.example.boardservice.service;

import com.example.boardservice.dto.models.ProjectRole;
import com.example.boardservice.dto.models.RolePermission;
import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RolePermissionFactory {
    private final PermissionMatrixService permissionMatrixService;

    public Set<RolePermission> createPermissions(ProjectRole role) {
        return switch (role.getName()) {
            case "Owner" -> createOwnerPermissions(role);
            case "User" -> createUserPermissions(role);
            case "Developer" -> createDeveloperPermissions(role);
            case "Code Reviewer" -> createCodeReviewerPermissions(role);
            case "QA Engineer" -> createQaEngineerPermissions(role);
            default -> throw new IllegalArgumentException("Unknown default role: " + role.getName());
        };
    }

    // owner роль
    private Set<RolePermission> createOwnerPermissions(ProjectRole role) {
        return Arrays.stream(EntityType.values())
                .flatMap(entity -> permissionMatrixService.getAllowedActions(entity).stream()
                        .map(action -> createPermission(role, entity, action)))
                .collect(Collectors.toSet());
    }

    // user роль (все VIEW кроме LOGS)
    private Set<RolePermission> createUserPermissions(ProjectRole role) {
        return Arrays.stream(EntityType.values())
                .filter(entity -> entity != EntityType.LOGS)
                .map(entity -> createPermission(role, entity, ActionType.VIEW))
                .collect(Collectors.toSet());
    }

    // developer роль
    private Set<RolePermission> createDeveloperPermissions(ProjectRole role) {
        Set<RolePermission> permissions = new HashSet<>();

        // базовый view
        addBaseViewPermissions(role, permissions);

        // забрать задачу, создание сабтасков, отправка задачи на review
        addPermissions(role, EntityType.ISSUE, Set.of(
                ActionType.TAKE_ISSUE, ActionType.CREATE_SUBTASK, ActionType.SUBMIT_FOR_REVIEW
        ), permissions);

        // доступ к комментариям, файлам и добавлению тегов
        addCommentPermissions(role, permissions);
        addAttachmentPermissions(role, permissions);
        addTagPermissions(role, permissions);

        return permissions;
    }

    // code reviewer роль
    private Set<RolePermission> createCodeReviewerPermissions(ProjectRole role) {
        Set<RolePermission> permissions = new HashSet<>();

        // базовый view
        addBaseViewPermissions(role, permissions);

        // отправить задачу обратно/на QA
        addPermissions(role, EntityType.ISSUE, Set.of(
                ActionType.TRANSITION_CODE_REVIEW
        ), permissions);

        // доступ к комментариям, файлам и добавлению тегов
        addCommentPermissions(role, permissions);
        addAttachmentPermissions(role, permissions);
        addTagPermissions(role, permissions);

        return permissions;
    }

    // qa engineer роль
    private Set<RolePermission> createQaEngineerPermissions(ProjectRole role) {
        Set<RolePermission> permissions = new HashSet<>();

        // базовый view
        addBaseViewPermissions(role, permissions);

        // отправить задачу обратно/на готовность к завершению
        addPermissions(role, EntityType.ISSUE, Set.of(
                ActionType.CREATE, ActionType.EDIT, ActionType.TRANSITION_QA
        ), permissions);

        // доступ к комментариям, файлам и добавлению тегов
        addCommentPermissions(role, permissions);
        addAttachmentPermissions(role, permissions);
        addTagPermissions(role, permissions);

        return permissions;
    }

    // добавить права просмотра (кроме logs)
    private void addBaseViewPermissions(ProjectRole role, Set<RolePermission> permissions) {
        Arrays.stream(EntityType.values())
                .filter(entity -> entity != EntityType.LOGS)
                .forEach(entity -> addPermissions(role, entity, Set.of(ActionType.VIEW), permissions));
    }

    // права на комментарии
    private void addCommentPermissions(ProjectRole role, Set<RolePermission> permissions) {
        addPermissions(role, EntityType.COMMENT, Set.of(
                ActionType.VIEW, ActionType.CREATE, ActionType.EDIT_OWN, ActionType.DELETE_OWN
        ), permissions);
    }

    // права на файлы
    private void addAttachmentPermissions(ProjectRole role, Set<RolePermission> permissions) {
        addPermissions(role, EntityType.ATTACHMENT, Set.of(
                ActionType.VIEW, ActionType.CREATE, ActionType.DELETE_OWN
        ), permissions);
    }

    // права на добавление тегов
    private void addTagPermissions(ProjectRole role, Set<RolePermission> permissions) {
        addPermissions(role, EntityType.TAG, Set.of(
                ActionType.VIEW, ActionType.APPLY
        ), permissions);
    }

    private void addPermissions(ProjectRole role, EntityType entity, Set<ActionType> actions, Set<RolePermission> permissions) {
        actions.forEach(action -> permissions.add(createPermission(role, entity, action)));
    }

    private RolePermission createPermission(ProjectRole role, EntityType entity, ActionType action) {
        return RolePermission.builder()
                .role(role)
                .entity(entity)
                .action(action)
                .build();
    }
}
