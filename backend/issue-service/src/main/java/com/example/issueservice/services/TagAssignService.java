package com.example.issueservice.services;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.ProjectTag;
import com.example.issueservice.dto.request.AssignTagDto;
import com.example.issueservice.dto.response.TagResponse;
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
public class TagAssignService {

    private final IssueRepository issueRepository;
    private final ProjectTagRepository tagRepository;

    @Transactional
    public void assignTagToIssue(Long issueId, AssignTagDto dto) {
        log.info("Assigning tag {} to issue {}", dto.getTagId(), issueId);
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found"));
        ProjectTag tag = tagRepository.findById(dto.getTagId())
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
        ProjectTag tag = tagRepository.findById(tagId)
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
                .map(TagResponse::from)
                .collect(Collectors.toList());
    }
}
