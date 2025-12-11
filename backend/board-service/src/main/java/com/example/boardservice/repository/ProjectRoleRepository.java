package com.example.boardservice.repository;

import com.example.boardservice.dto.models.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Long> {

    Optional<ProjectRole> findByProject_IdAndIsDefaultTrue(Long projectId);

    @Query("SELECT pr.isOwner FROM ProjectRole pr WHERE pr.id = :roleId")
    boolean isOwnerRole(@Param("roleId") Long roleId);

    @Query("SELECT DISTINCT pr FROM ProjectRole pr LEFT JOIN FETCH pr.permissions WHERE pr.project.id = :projectId")
    List<ProjectRole> findByProject_IdWithPermissions(@Param("projectId") Long projectId);

    @Query("SELECT r.id FROM ProjectRole r WHERE r.project.id = :projectId")
    List<Long> findRoleIdsByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT DISTINCT pr FROM ProjectRole pr " +
            "LEFT JOIN FETCH pr.permissions " +
            "WHERE pr.id = (SELECT pm.role.id FROM ProjectMember pm " +
            "WHERE pm.userId = :userId AND pm.project.id = :projectId)")
    Optional<ProjectRole> findByUserIdAndProjectId(@Param("userId") Long userId,
                                                   @Param("projectId") Long projectId);

    @Query("SELECT r FROM ProjectRole r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<ProjectRole> findByIdWithPermissions(@Param("id") Long id);
}
