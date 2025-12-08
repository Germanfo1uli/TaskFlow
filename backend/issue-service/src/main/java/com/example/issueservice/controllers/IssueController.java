package controllers;

import dto.request.*;
import dto.response.*;
import services.IssueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    // --- Создание задачи ---
    @PostMapping
    public ResponseEntity<IssueDetailsDto> createIssue(@Valid @RequestBody CreateIssueDto dto) {
        log.info("Request to create issue: {}", dto.getTitle());
        IssueDetailsDto createdIssue = issueService.createIssue(dto);
        return new ResponseEntity<>(createdIssue, HttpStatus.CREATED);
    }

    // --- Получение задачи по ID ---
    @GetMapping("/{id}")
    public ResponseEntity<IssueDetailsDto> getIssueById(@PathVariable Long id) {
        log.info("Request to get issue by id: {}", id);
        IssueDetailsDto issue = issueService.getIssueById(id);
        return ResponseEntity.ok(issue);
    }

    // --- Получение всех задач проекта ---
    @GetMapping
    public ResponseEntity<List<IssueSummaryDto>> getIssuesByProject(@RequestParam Long projectId) {
        log.info("Request to get all issues for project: {}", projectId);

        List<IssueSummaryDto> issueSummaries = issueService.getIssueSummariesByProject(projectId);

        return ResponseEntity.ok(issueSummaries);
    }

    // --- Обновление задачи ---
    @PutMapping("/{id}")
    public ResponseEntity<IssueDetailsDto> updateIssue(@PathVariable Long id, @Valid @RequestBody UpdateIssueDto dto) {
        log.info("Request to update issue with id: {}", id);
        // TODO: В сервисе нужно реализовать метод updateIssue(id, dto)
        // IssueDetailsDto updatedIssue = issueService.updateIssue(id, dto);
        // return ResponseEntity.ok(updatedIssue);
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    // --- Удаление задачи ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        log.info("Request to delete issue with id: {}", id);
        // TODO: В сервисе нужно реализовать метод deleteIssue(id)
        // issueService.deleteIssue(id);
        // return ResponseEntity.noContent().build();
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    // --- Управление исполнителями ---
    @PostMapping("/{issueId}/assignees")
    public ResponseEntity<Void> addAssignee(@PathVariable Long issueId, @Valid @RequestBody AssignUserDto dto) {
        log.info("Request to assign user {} to issue {}", dto.getUserId(), issueId);
        issueService.addAssignee(issueId, dto.getUserId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{issueId}/assignees/{userId}")
    public ResponseEntity<Void> removeAssignee(@PathVariable Long issueId, @PathVariable Long userId) {
        log.info("Request to remove user {} from issue {}", userId, issueId);
        issueService.removeAssignee(issueId, userId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // --- Управление тегами (будет использовать TagService) ---
    @PostMapping("/{issueId}/tags")
    public ResponseEntity<Void> assignTagToIssue(@PathVariable Long issueId, @Valid @RequestBody AssignTagDto dto) {
        log.info("Request to assign tag {} to issue {}", dto.getTagId(), issueId);
        // tagService.assignTagToIssue(issueId, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{issueId}/tags/{tagId}")
    public ResponseEntity<Void> removeTagFromIssue(@PathVariable Long issueId, @PathVariable Long tagId) {
        log.info("Request to remove tag {} from issue {}", tagId, issueId);
        // tagService.removeTagFromIssue(issueId, tagId);
        return ResponseEntity.noContent().build();
    }
}