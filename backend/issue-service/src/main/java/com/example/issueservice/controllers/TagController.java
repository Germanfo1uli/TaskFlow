package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.CreateTagResponse;
import com.example.issueservice.dto.request.UpdateTagRequest;
import com.example.issueservice.dto.response.TagResponse;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Tag Management", description = "Управление тегами в проекте")
public class TagController {

    private final TagService tagService;

    @Operation(
            summary = "Создание тега",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<TagResponse> createProjectTag(
            @Valid @RequestBody CreateTagResponse request,
            @AuthenticationPrincipal JwtUser principal) {

        log.info("Request to create tag '{}' for project {}", request.name(), request.projectId());
        TagResponse response = tagService.createProjectTag(principal.userId(), request.projectId(), request.name());

        log.info("Successfully created project tag with id: {}", response.id());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Получение всех тегов проекта",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping
    public ResponseEntity<List<TagResponse>> getTagsByProject(
            @RequestParam Long projectId,
            @AuthenticationPrincipal JwtUser principal) {

        log.info("Request to get all tags for project: {}", projectId);
        List<TagResponse> tags = tagService.getTagsByProject(principal.userId(), projectId);

        return ResponseEntity.ok(tags);
    }

    @Operation(
            summary = "Обновление тега",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PatchMapping("/{tagId}")
    public ResponseEntity<TagResponse> updateProjectTag(
            @PathVariable Long tagId,
            @RequestBody UpdateTagRequest request,
            @AuthenticationPrincipal JwtUser principal) {

        log.info("Request to update project tag with id: {}", tagId);
        TagResponse tag = tagService.updateProjectTag(
                principal.userId(), tagId, request.name());

        log.info("Successfully update project tag {}", tagId);
        return ResponseEntity.ok(tag);
    }

    @Operation(
            summary = "Удаление тега",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{tagId}")
    public ResponseEntity<?> deleteProjectTag(
            @PathVariable Long tagId,
            @AuthenticationPrincipal JwtUser principal) {

        log.info("Request to delete project tag with id: {}", tagId);
        tagService.deleteProjectTag(principal.userId(), tagId);

        log.info("Successfully deleted project tag {}", tagId);
        return ResponseEntity.noContent().build();
    }
}