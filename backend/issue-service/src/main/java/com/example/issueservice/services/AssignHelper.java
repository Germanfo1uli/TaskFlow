package com.example.issueservice.services;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.AssignmentType;
import com.example.issueservice.exception.AccessDeniedException;
import com.example.issueservice.exception.RoleAlreadyAssignedException;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public final class AssignHelper {

    // получение нужного исполнителя в зависимости от типа
    public Long getAssignee(Issue issue, AssignmentType type) {
        return switch (type) {
            case ASSIGNEE -> issue.getAssigneeId();
            case CODE_REVIEWER -> issue.getCodeReviewerId();
            case QA_ENGINEER -> issue.getQaEngineerId();
        };
    }

    public void setAssignee(Issue issue, AssignmentType type, Long userId) {
        switch (type) {
            case ASSIGNEE -> issue.setAssigneeId(userId);
            case CODE_REVIEWER -> issue.setCodeReviewerId(userId);
            case QA_ENGINEER -> issue.setQaEngineerId(userId);
        }
    }

    // проверка на уже назначенного пользователя
    public void validateRoleAvailable(Issue issue, Long userId, AssignmentType type) {
        Long currentAssignee = getAssignee(issue, type);
        if (currentAssignee != null && !Objects.equals(currentAssignee, userId)) {
            throw new RoleAlreadyAssignedException("Role " + type.name() + " is already assigned to user " + currentAssignee);
        }
    }

    public void validateUserAssignedToRole(Issue issue, Long userId, AssignmentType type) {
        Long assignedUser = getAssignee(issue, type);
        if (assignedUser == null) {
            throw new AccessDeniedException("Role " + type.name() + " is not assigned to anyone in issue " + issue.getId());
        }
        if (!Objects.equals(userId, assignedUser)) {
            throw new AccessDeniedException("User " + userId + " is not assigned as " + type.name() + " for issue " + issue.getId());
        }
    }
}