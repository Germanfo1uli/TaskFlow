package services;

import dto.request.AssignTagDto;
import dto.request.CreateProjectTagDto;
import dto.response.TagDto;
import exception.IssueNotFoundException;
import exception.ProjectTagNotFoundException;
import models.Issue;
import models.ProjectTag;
import repositories.IssueRepository;
import repositories.ProjectTagRepository;
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

    // --- Управление тегами проекта ---

    @Transactional
    public TagDto createProjectTag(CreateProjectTagDto dto) {
        log.info("Creating tag '{}' for project {}", dto.getName(), dto.getProjectId());

        if (projectTagRepository.findByProjectIdAndName(dto.getProjectId(), dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Tag with name '" + dto.getName() + "' already exists in this project");
        }

        ProjectTag newTag = ProjectTag.builder()
                .projectId(dto.getProjectId())
                .name(dto.getName())
                .build();
        ProjectTag savedTag = projectTagRepository.save(newTag);
        log.info("Successfully created project tag with id: {}", savedTag.getId());
        return convertToDto(savedTag);
    }

    public List<TagDto> getTagsByProject(Long projectId) {
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

    public List<TagDto> getTagsByIssue(Long issueId) {
        log.info("Fetching tags for issue: {}", issueId);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found"));

        return issue.getTags().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private TagDto convertToDto(ProjectTag tag) {
        return TagDto.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }
}