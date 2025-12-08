package com.example.issueservice.dto.request;

import com.example.issueservice.dto.models.Issue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateIssueDto {
    private Long projectId;
    private Long parentIssueId;
    private String title;
    private String description;
    private Issue.IssueType type;
    private Issue.Priority priority;
    private LocalDateTime deadline;
}
