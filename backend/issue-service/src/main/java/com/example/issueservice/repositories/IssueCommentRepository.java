package com.example.issueservice.repositories;

import com.example.issueservice.dto.models.IssueComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IssueCommentRepository extends JpaRepository<IssueComment, Long> {

    // Найти все комментарии для задачи, упорядоченные по дате создания
    List<IssueComment> findByIssueIdOrderByCreatedAtAsc(Long issueId);
}
