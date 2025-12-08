package com.example.boardservice.repository;

import com.example.boardservice.dto.models.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Long> {
    Optional<ProjectRole> findByProject_IdAndIsDefaultTrue(Long projectId);
    Optional<ProjectRole> findByIdAndProject_Id(Long roleId, Long projectId);
    List<ProjectRole> findByProject_Id(Long projectId);
    @Query("SELECT pr.isOwner FROM ProjectRole pr WHERE pr.id = :roleId")
    boolean isOwnerRole(@Param("roleId") Long roleId);
    @Query("SELECT DISTINCT pr FROM ProjectRole pr LEFT JOIN FETCH pr.permissions WHERE pr.project.id = :projectId")
    List<ProjectRole> findByProject_IdWithPermissions(@Param("projectId") Long projectId);
}
