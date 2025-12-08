package models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "issues", schema = "issues-service-schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Связи с ВНЕШНИМИ сервисами (оставляем как ID) ---
    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    // --- ВНУТРЕННИЕ связи сервиса ---

    // Самосвязь: родительская задача
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_issue_id")
    private Issue parentIssue;

    // Самосвязь: дочерние задачи
    @OneToMany(mappedBy = "parentIssue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Issue> childIssues = new ArrayList<>();

    // Связь с комментариями
    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IssueComment> comments = new ArrayList<>();

    // Связь с вложениями
    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true
    )
    private List<Attachment> attachments = new ArrayList<>();

    // Связь с исполнителями (многие-ко-многим)
    @ManyToMany
    @JoinTable(
            name = "issue_assignees",
            joinColumns = @JoinColumn(name = "issue_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<IssueAssignee> assignees = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "issue_tags",
            joinColumns = @JoinColumn(name = "issue_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<ProjectTag> tags = new HashSet<>();

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private IssueStatus status;

    @Enumerated(EnumType.STRING)
    private IssueType type;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private LocalDateTime deadline;

    @CreationTimestamp // Автоматически ставится при создании
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // Автоматически обновляется при каждом изменении сущности
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum IssueStatus {
        TO_DO, SELECTED_FOR_DEVELOPMENT, IN_PROGRESS, CODE_REVIEW, QA, STAGING, DONE
    }

    public enum IssueType {
        TASK, BUG, STORY, EPIC
    }

    public enum Priority {
        DEFERRED, LOW, MEDIUM, HIGH, MAJOR, CRITICAL
    }
}
