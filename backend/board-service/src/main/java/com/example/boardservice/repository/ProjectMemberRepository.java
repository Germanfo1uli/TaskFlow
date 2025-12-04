package com.example.boardservice.repository;

import com.example.boardservice.dto.models.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    boolean existsByProject_IdAndUserId(Long projectId, Long userId);
}
