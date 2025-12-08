package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.Issue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueSummaryDto {
    private Long id;
    private String title;
    private Issue.IssueStatus status;
    private Issue.IssueType type;
    private Issue.Priority priority;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private String projectName;
    private String creatorName;
    private List<Long> assigneeIds;
}
