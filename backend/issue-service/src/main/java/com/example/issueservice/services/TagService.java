package com.example.issueservice.services;

import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.EntityType;
import com.example.issueservice.dto.request.AssignTagDto;
import com.example.issueservice.dto.request.CreateProjectTagResponse;
import com.example.issueservice.dto.response.TagResponse;
import com.example.issueservice.exception.ProjectTagNotFoundException;
import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.ProjectTag;
import com.example.issueservice.exception.TagAlreadyExistsException;
import com.example.issueservice.repositories.IssueRepository;
import com.example.issueservice.repositories.ProjectTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TagService {

    private final ProjectTagRepository projectTagRepository;
    private final IssueRepository issueRepository;
    private final AuthService authService;

    @Transactional
    public TagResponse createProjectTag(Long userId, Long projectId, String name) {

        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.CREATE);

        log.info("Creating tag '{}' for project {}", name, projectId);

        if(projectTagRepository.existsByProjectIdAndName(projectId, name)) {
            throw new TagAlreadyExistsException("Tag " + name + "already exists in project " + projectId);
        }

        ProjectTag newTag = ProjectTag.builder()
                .projectId(dto.getProjectId())
                .name(dto.getName())
                .build();
        ProjectTag savedTag = projectTagRepository.save(newTag);
        log.info("Successfully created project tag with id: {}", savedTag.getId());
        return convertToDto(savedTag);
    }

    public List<TagResponse> getTagsByProject(Long projectId) {
        log.info("Fetching all tags for project: {}", projectId);
        List<ProjectTag> tags = projectTagRepository.findByProjectId(projectId);
        return tags.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteProjectTag(Long tagId) {
        log.info("Deleting project tag with id: {}", tagId);
        if (!projectTagRepository.existsById(tagId)) {
            throw new ProjectTagNotFoundException("Project tag with id " + tagId + " not found");
        }
        projectTagRepository.deleteById(tagId);
        log.info("Successfully deleted project tag {}", tagId);
    }

    // --- Управление привязкой тегов к задачам ---

    @Transactional
    public void assignTagToIssue(Long issueId, AssignTagDto dto) {
        log.info("Assigning tag {} to issue {}", dto.getTagId(), issueId);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
        ProjectTag tag = projectTagRepository.findById(dto.getTagId())
                .orElseThrow(() -> new IllegalArgumentException("Tag not found"));

        issue.getTags().add(tag);
        issueRepository.save(issue);
        log.info("Successfully assigned tag to issue.");
    }


    @Transactional
    public void removeTagFromIssue(Long issueId, Long tagId) {
        log.info("Removing tag {} from issue {}", tagId, issueId);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
        ProjectTag tag = projectTagRepository.findById(tagId)
                .orElseThrow(() -> new IllegalArgumentException("Tag not found"));

        issue.getTags().remove(tag);
        issueRepository.save(issue);
        log.info("Successfully removed tag from issue.");
    }

    public List<TagResponse> getTagsByIssue(Long issueId) {
        log.info("Fetching tags for issue: {}", issueId);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found"));

        return issue.getTags().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private TagResponse convertToDto(ProjectTag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }
}