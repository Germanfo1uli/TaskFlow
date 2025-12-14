package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.IssueType;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Минимальная информация о родительской задаче")
public record ParentIssueResponse(
        @Schema(description = "ID родительской задачи", example = "123")
        Long id,

        @Schema(description = "Название родительской задачи", example = "Сделать микросервисы")
        String title,

        @Schema(description = "Тип родительской задачи", example = "EPIC")
        IssueType type
) {
    public static ParentIssueResponse from(Issue issue) {
        if (issue == null) {
            return null;
        }
        return new ParentIssueResponse(
                issue.getId(),
                issue.getTitle(),
                issue.getType()
        );
    }
}