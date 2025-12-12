package com.example.issueservice.repositories;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.enums.IssueStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    @EntityGraph(attributePaths = {"tags"})
    List<Issue> findByProjectId(Long projectId);

    @EntityGraph(attributePaths = {"tags"})
    Optional<Issue> findWithTagsById(Long id);
}