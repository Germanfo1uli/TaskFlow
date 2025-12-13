package com.example.issueservice.services;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.IssueType;
import com.example.issueservice.exception.InvalidIssueHierarchyException;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class IssueHierarchyValidator {

    public void validateHierarchy(Issue issue, Issue parent) {
        switch (issue.getType()) {
            case EPIC -> {
                if (parent != null) {
                    throw new InvalidIssueHierarchyException("Epic cannot have a parent");
                }
                issue.setLevel(1);
            }
            case STORY, TASK, BUG -> {
                if (parent != null && parent.getType() != IssueType.EPIC) {
                    throw new InvalidIssueHierarchyException(
                            "Story/Task/Bug can only be child of Epic. Current parent: " + parent.getType());
                }
                issue.setLevel(2);
                if (parent != null) {
                    issue.setProjectId(parent.getProjectId());
                }
            }
            case SUB_TASK -> {
                if (parent == null) {
                    throw new InvalidIssueHierarchyException("Sub-task must have a parent");
                }
                if (!Set.of(IssueType.STORY, IssueType.TASK, IssueType.BUG)
                        .contains(parent.getType())) {
                    throw new InvalidIssueHierarchyException(
                            "Sub-task can only be child of Story/Task/Bug. Current parent: " + parent.getType());
                }
                issue.setLevel(3);
                issue.setProjectId(parent.getProjectId());
            }
        }
    }
}