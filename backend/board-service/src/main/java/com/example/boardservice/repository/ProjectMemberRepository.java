package com.example.boardservice.repository;

import com.example.boardservice.dto.models.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    boolean existsByProject_IdAndUserId(Long projectId, Long userId);
    List<ProjectMember> findAllByRoleId(Long roleId);
    List<ProjectMember> findAllByRole_IdAndProject_Id(Long roleId, Long projectId);
    Optional<ProjectMember> findByUserIdAndProject_Id(Long userId, Long projectId);
    @Query("SELECT pm.role.id FROM ProjectMember pm WHERE pm.userId = :userId AND pm.project.id = :projectId")
    Optional<Long> findRoleIdByUserIdAndProjectId(@Param("userId") Long userId, @Param("projectId") Long projectId);
}
