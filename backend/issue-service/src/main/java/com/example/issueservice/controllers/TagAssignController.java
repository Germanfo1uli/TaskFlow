package com.example.issueservice.controllers;

import com.example.issueservice.dto.request.AssignTagDto;
import com.example.issueservice.dto.response.TagResponse;
import com.example.issueservice.services.TagAssignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Tag Assign Management", description = "Управление назначениями тегов на задачи в проекте")
public class TagAssignController {

    private final TagAssignService tagAssignService;

    @Operation(
            summary = "Назначение тега задаче",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/issues/{issueId}/tags/{tagId}")
    public ResponseEntity<Void> assignTagToIssue(
            @PathVariable Long issueId,
            @Valid @RequestBody AssignTagDto dto) {
        log.info("Request to assign tag {} to issue {}", dto.getTagId(), issueId);
        tagAssignService.assignTagToIssue(issueId, dto);
        log.info("Successfully assigned tag to issue.");
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/issues/{issueId}/tags/{tagId}")
    public ResponseEntity<Void> removeTagFromIssue(
            @PathVariable Long issueId,
            @PathVariable Long tagId) {
        log.info("Request to remove tag {} from issue {}", tagId, issueId);
        tagAssignService.removeTagFromIssue(issueId, tagId);
        log.info("Successfully removed tag from issue.");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/issues/{issueId}")
    public ResponseEntity<List<TagResponse>> getTagsByIssue(@PathVariable Long issueId) {
        log.info("Request to get all tags for issue: {}", issueId);
        List<TagResponse> tags = tagAssignService.getTagsByIssue(issueId);
        return ResponseEntity.ok(tags);
    }
}
