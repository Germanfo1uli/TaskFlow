package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.AssignTagDto;
import com.example.issueservice.dto.request.CreateProjectTagDto;
import com.example.issueservice.dto.response.TagDto;
import com.example.issueservice.services.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    // --- Управление тегами проекта ---

    /**
     * Создать новый тег в рамках проекта.
     * Пример запроса: POST /api/tags/projects/123
     */
    @PostMapping("/projects/{projectId}")
    public ResponseEntity<TagDto> createProjectTag(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateProjectTagDto dto) {
        log.info("Request to create tag '{}' for project {}", dto.getName(), projectId);
        TagDto createdTag = tagService.createProjectTag(dto);
        log.info("Successfully created project tag with id: {}", createdTag.getId());
        return new ResponseEntity<>(createdTag, HttpStatus.CREATED);
    }

    /**
     * Получить все теги для конкретного проекта.
     * Пример запроса: GET /api/tags/projects/123
     */
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<List<TagDto>> getTagsByProject(@PathVariable Long projectId) {
        log.info("Request to get all tags for project: {}", projectId);
        List<TagDto> tags = tagService.getTagsByProject(projectId);
        return ResponseEntity.ok(tags);
    }

    /**
     * Удалить тег проекта.
     * Пример запроса: DELETE /api/tags/456
     */
    @DeleteMapping("/{tagId}")
    public ResponseEntity<Void> deleteProjectTag(@PathVariable Long tagId) {
        log.info("Request to delete project tag with id: {}", tagId);
        tagService.deleteProjectTag(tagId);
        log.info("Successfully deleted project tag {}", tagId);
        return ResponseEntity.noContent().build();
    }

    // --- Управление привязкой тегов к задачам ---

    /**
     * Привязать существующий тег к задаче.
     * Пример запроса: POST /api/tags/issues/123
     */
    @PostMapping("/issues/{issueId}")
    public ResponseEntity<Void> assignTagToIssue(
            @PathVariable Long issueId,
            @Valid @RequestBody AssignTagDto dto) {
        log.info("Request to assign tag {} to issue {}", dto.getTagId(), issueId);
        tagService.assignTagToIssue(issueId, dto);
        log.info("Successfully assigned tag to issue.");
        return ResponseEntity.ok().build();
    }

    /**
     * Отвязать тег от задачи.
     * Пример запроса: DELETE /api/tags/issues/123/tags/456
     */
    @DeleteMapping("/issues/{issueId}/tags/{tagId}")
    public ResponseEntity<Void> removeTagFromIssue(
            @PathVariable Long issueId,
            @PathVariable Long tagId) {
        log.info("Request to remove tag {} from issue {}", tagId, issueId);
        tagService.removeTagFromIssue(issueId, tagId);
        log.info("Successfully removed tag from issue.");
        return ResponseEntity.noContent().build();
    }

    /**
     * Получить все теги, привязанные к конкретной задаче.
     * Пример запроса: GET /api/tags/issues/123
     */
    @GetMapping("/issues/{issueId}")
    public ResponseEntity<List<TagDto>> getTagsByIssue(@PathVariable Long issueId) {
        log.info("Request to get all tags for issue: {}", issueId);
        List<TagDto> tags = tagService.getTagsByIssue(issueId);
        return ResponseEntity.ok(tags);
    }
}