package com.example.issueservice.repositories;

import com.example.issueservice.dto.models.Issue;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    @EntityGraph(attributePaths = {"tags", "parentIssue"})
    List<Issue> findByProjectId(Long projectId);

    @EntityGraph(attributePaths = {"tags", "comments", "parentIssue"})
    Optional<Issue> findWithFieldsById(Long id);

    List<Issue> findAllByProjectId(Long projectId);
}