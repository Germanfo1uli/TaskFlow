package com.example.boardservice.repository;

import com.example.boardservice.dto.models.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Long> {
    Optional<ProjectRole> findByProject_IdAndIsDefaultTrue(Long projectId);
    Optional<ProjectRole> findByIdAndProject_Id(Long roleId, Long projectId);
    List<ProjectRole> findByProject_Id(Long projectId);
}
