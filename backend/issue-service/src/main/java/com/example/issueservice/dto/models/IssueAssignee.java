package com.example.issueservice.dto.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Objects;

@Entity
@Table(name = "issue_assignees", schema = "issues-service-schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueAssignee {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IssueAssignee that = (IssueAssignee) o;
        return Objects.equals(issue.getId(), that.issue.getId()) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(issue.getId(), userId);
    }
}
