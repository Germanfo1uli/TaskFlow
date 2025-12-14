package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.ProjectTag;
import io.swagger.v3.oas.annotations.media.Schema;

public record TagResponse (
        @Schema(description = "ID тега", example = "123")
        Long id,

        @Schema(description = "ID проекта", example = "123")
        Long projectId,

        @Schema(description = "Название тега", example = "Machine Learning")
        String name
) {
        public static TagResponse from(ProjectTag tag) {
                return new TagResponse(tag.getId(), tag.getProjectId(), tag.getName());
        }
}
