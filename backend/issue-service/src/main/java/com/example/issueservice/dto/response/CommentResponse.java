package com.example.issueservice.dto.response;

import com.example.issueservice.dto.models.IssueComment;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record CommentResponse (
        @Schema(description = "ID комментария", example = "123")
        Long id,

        @Schema(description = "Комментарий к задаче", example = "Классно, но переделывай")
        String text,

        @Schema(description = "Данные об авторе комментария")
        PublicProfileResponse creator,

        @Schema(description = "Дата создания комментария")
        LocalDateTime createdAt,

        @Schema(description = "Дата изменения комментария")
        LocalDateTime updatedAt
) {
        public static CommentResponse from(IssueComment comment, PublicProfileResponse creator) {
                return new CommentResponse(
                        comment.getId(),
                        comment.getText(),
                        creator,
                        comment.getCreatedAt(),
                        comment.getUpdatedAt()
                );
        }
}