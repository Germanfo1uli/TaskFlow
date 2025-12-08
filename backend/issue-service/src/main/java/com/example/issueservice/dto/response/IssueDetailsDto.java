package dto.response;

import models.Issue;
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
public class IssueDetailsDto {
    private Long id;
    private String title;
    private String description;
    private Issue.IssueStatus status;
    private Issue.IssueType type;
    private Issue.Priority priority;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Поля из других сервисов
    private String projectName;
    private String projectKey;
    private String creatorName;
    private List<String> assigneeNames;
    private List<CommentDto> comments;
}
