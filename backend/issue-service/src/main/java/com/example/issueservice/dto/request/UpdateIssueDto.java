package com.example.issueservice.dto.request;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.IssueStatus;
import com.example.issueservice.dto.models.enums.IssueType;
import com.example.issueservice.dto.models.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateIssueDto {
    private String title;
    private String description;
    private IssueStatus status;
    private IssueType type;
    private Priority priority;
    private LocalDateTime deadline;
}
