package com.example.issueservice.repositories;

import com.example.issueservice.dto.models.ProjectTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectTagRepository extends JpaRepository<ProjectTag, Long> {
    List<ProjectTag> findByProjectId(Long projectId);

    boolean existsByProjectIdAndName(Long projectId, String name);

    Optional<ProjectTag> findByIdAndProjectId(Long id, Long projectId);
}