package com.example.issueservice.services;

import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.EntityType;
import com.example.issueservice.dto.response.TagResponse;
import com.example.issueservice.exception.ProjectTagNotFoundException;
import com.example.issueservice.dto.models.ProjectTag;
import com.example.issueservice.exception.TagAlreadyExistsException;
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
    private final AuthService authService;

    @Transactional
    public TagResponse createProjectTag(Long userId, Long projectId, String name) {

        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.CREATE);

        log.info("Creating tag '{}' for project {}", name, projectId);

        if(projectTagRepository.existsByProjectIdAndName(projectId, name)) {
            throw new TagAlreadyExistsException("Tag " + name + "already exists in project " + projectId);
        }

        ProjectTag newTag = ProjectTag.builder()
                .projectId(projectId)
                .name(name)
                .build();

        ProjectTag savedTag = projectTagRepository.save(newTag);

        log.info("Successfully created project tag with id: {}", savedTag.getId());

        return TagResponse.from(savedTag);
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getTagsByProject(Long userId, Long projectId) {

        authService.hasPermission(userId, projectId, EntityType.TAG, ActionType.VIEW);

        log.info("Fetching all tags for project: {}", projectId);
        List<ProjectTag> tags = projectTagRepository.findByProjectId(projectId);

        return tags.stream()
                .map(TagResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public TagResponse updateProjectTag(Long userId,Long tagId, String name) {

        ProjectTag tag = projectTagRepository.findById(tagId)
                .orElseThrow(() -> new ProjectTagNotFoundException("Tag with ID " + tagId + " not found"));

        authService.hasPermission(userId, tag.getProjectId(), EntityType.TAG, ActionType.EDIT);

        log.info("Updating project tag with id: {}", tagId);

        tag.setName(name);

        projectTagRepository.save(tag);
        log.info("Successfully updated project tag {}", tagId);

        return TagResponse.from(tag);
    }

    @Transactional
    public void deleteProjectTag(Long userId, Long tagId) {

        ProjectTag tag = projectTagRepository.findById(tagId)
                .orElseThrow(() -> new ProjectTagNotFoundException("Tag with ID " + tagId + " not found"));

        authService.hasPermission(userId, tag.getProjectId(), EntityType.TAG, ActionType.DELETE);

        log.info("Deleting project tag with id: {}", tagId);

        projectTagRepository.deleteById(tagId);
        log.info("Successfully deleted project tag {}", tagId);
    }
}