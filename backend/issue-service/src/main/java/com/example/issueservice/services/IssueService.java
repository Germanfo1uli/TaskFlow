package services;

import dto.request.CreateIssueDto;
import dto.response.IssueDetailsDto;
import dto.response.IssueSummaryDto;
import exception.IssueNotFoundException;
import models.Issue;
import models.IssueAssignee;
import repositories.IssueRepository;
import repositories.IssueAssigneeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueAssigneeRepository issueAssigneeRepository;
    private final RestTemplate restTemplate;

    @Transactional
    public IssueDetailsDto createIssue(CreateIssueDto dto) {
        log.info("Creating new issue for project: {}", dto.getProjectId());

        Issue parentIssue = null;
        if (dto.getParentIssueId() != null) {
            parentIssue = issueRepository.findById(dto.getParentIssueId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent issue with id " + dto.getParentIssueId() + " not found"));
            log.info("Found parent issue: {}", parentIssue.getTitle());

        }
        Issue newIssue = Issue.builder()
                .projectId(dto.getProjectId())
                .parentIssue(parentIssue)
                .creatorId(1L) // TODO: Взять ID из контекста безопасности (JWT)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .priority(dto.getPriority())
                .deadline(dto.getDeadline())
                .status(Issue.IssueStatus.TO_DO)
                .build();

        Issue savedIssue = issueRepository.save(newIssue);
        log.info("Successfully created issue with id: {}", savedIssue.getId());

        return convertToDto(savedIssue);
    }

    public IssueDetailsDto getIssueById(Long id) {
        log.info("Fetching issue by id: {}", id);

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException("Issue with id " + id + " not found"));

        log.info("Found issue: '{}'. Enriching with data from other services...", issue.getTitle());
        return enrichIssueWithDetails(issue);
    }

    public List<IssueDetailsDto> getIssuesByProject(Long projectId) {
        log.info("Fetching all issues for project: {}", projectId);
        List<Issue> issues = issueRepository.findByProjectId(projectId);
        return issues.stream()
                .map(this::enrichIssueWithDetails)
                .collect(Collectors.toList());
    }

    public List<IssueSummaryDto> getIssueSummariesByProject(Long projectId) {
        log.info("Fetching all issue SUMMARIES for project: {}", projectId);
        List<Issue> issues = issueRepository.findByProjectId(projectId);

        return issues.stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }
    @Transactional
    public void addAssignee(Long issueId, Long userId) {
        log.info("Adding user {} as assignee to issue {}", userId, issueId);
        if (issueAssigneeRepository.existsByIssueIdAndUserId(issueId, userId)) {
            log.warn("User {} is already an assignee for issue {}", userId, issueId);
            return;
        }
        IssueAssignee newAssignee = IssueAssignee.builder()
                .issue(Issue.builder().id(issueId).build())
                .userId(userId)
                .build();
        issueAssigneeRepository.save(newAssignee);
        log.info("Successfully added assignee.");
    }

    @Transactional
    public void removeAssignee(Long issueId, Long userId) {
        log.info("Removing user {} from assignees of issue {}", userId, issueId);
        issueAssigneeRepository.deleteByIssueIdAndUserId(issueId, userId);
        log.info("Successfully removed assignee.");
    }
    // нужно связать с существующими api
    private IssueDetailsDto enrichIssueWithDetails(Issue issue) {
        // Вызовы к другим микросервисам
        String projectUrl = "http://project-service/api/projects/" + issue.getProjectId();
        String userUrl = "http://user-service/api/users/" + issue.getCreatorId();

        try {
            // TODO: здесь будут полноценные DTO, а не строки
            String projectName = restTemplate.getForObject(projectUrl, String.class);
            String creatorName = restTemplate.getForObject(userUrl, String.class);

            // Получаем ID исполнителей и запрашиваем их имена
            List<Long> assigneeIds = issueAssigneeRepository.findByIssueId(issue.getId())
                    .stream()
                    .map(IssueAssignee::getUserId)
                    .collect(Collectors.toList());
            // TODO: Сделать один вызов в user-service с пачкой ID
            // List<String> assigneeNames = restTemplate.postForObject(userServiceUrl + "/batch", assigneeIds, ...);

            return IssueDetailsDto.builder()
                    .id(issue.getId())
                    .title(issue.getTitle())
                    .description(issue.getDescription())
                    .status(issue.getStatus())
                    .type(issue.getType())
                    .priority(issue.getPriority())
                    .deadline(issue.getDeadline())
                    .createdAt(issue.getCreatedAt())
                    .updatedAt(issue.getUpdatedAt())
                    .projectName(projectName)
                    .creatorName(creatorName)
                    .assigneeNames(List.of("User1", "User2")) // Заглушка
                    .build();

        } catch (Exception e) {
            log.error("Error while enriching issue {}. Returning partial data.", issue.getId(), e);
            return convertToDto(issue);
        }
    }

    private IssueSummaryDto convertToSummaryDto(Issue issue) {
        return IssueSummaryDto.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .status(issue.getStatus())
                .type(issue.getType())
                .priority(issue.getPriority())
                .deadline(issue.getDeadline())
                .createdAt(issue.getCreatedAt())
                // TODO: Когда будет RabbitMQ, здесь можно будет добавлять projectName, creatorName и т.д.
                .build();
    }

    private IssueDetailsDto convertToDto(Issue issue) {

        return IssueDetailsDto.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .status(issue.getStatus())
                .type(issue.getType())
                .priority(issue.getPriority())
                .deadline(issue.getDeadline())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }

}


