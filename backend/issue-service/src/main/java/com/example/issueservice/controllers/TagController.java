package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.AssignTagDto;
import com.example.issueservice.dto.request.CreateProjectTagResponse;
import com.example.issueservice.dto.response.TagResponse;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @Operation(
            summary = "Создание тега",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/tags")
    public ResponseEntity<TagResponse> createProjectTag(
            @Valid @RequestBody CreateProjectTagResponse request,
            @AuthenticationPrincipal JwtUser principal) {

        log.info("Request to create tag '{}' for project {}", request.name(), request.projectId());
        TagResponse response = tagService.createProjectTag(principal.userId(), request.projectId(), request.name());

        log.info("Successfully created project tag with id: {}", response.id());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<List<TagResponse>> getTagsByProject(@PathVariable Long projectId) {
        log.info("Request to get all tags for project: {}", projectId);
        List<TagResponse> tags = tagService.getTagsByProject(projectId);
        return ResponseEntity.ok(tags);
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<Void> deleteProjectTag(@PathVariable Long tagId) {
        log.info("Request to delete project tag with id: {}", tagId);
        tagService.deleteProjectTag(tagId);
        log.info("Successfully deleted project tag {}", tagId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/issues/{issueId}")
    public ResponseEntity<Void> assignTagToIssue(
            @PathVariable Long issueId,
            @Valid @RequestBody AssignTagDto dto) {
        log.info("Request to assign tag {} to issue {}", dto.getTagId(), issueId);
        tagService.assignTagToIssue(issueId, dto);
        log.info("Successfully assigned tag to issue.");
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/issues/{issueId}/tags/{tagId}")
    public ResponseEntity<Void> removeTagFromIssue(
            @PathVariable Long issueId,
            @PathVariable Long tagId) {
        log.info("Request to remove tag {} from issue {}", tagId, issueId);
        tagService.removeTagFromIssue(issueId, tagId);
        log.info("Successfully removed tag from issue.");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/issues/{issueId}")
    public ResponseEntity<List<TagResponse>> getTagsByIssue(@PathVariable Long issueId) {
        log.info("Request to get all tags for issue: {}", issueId);
        List<TagResponse> tags = tagService.getTagsByIssue(issueId);
        return ResponseEntity.ok(tags);
    }
}