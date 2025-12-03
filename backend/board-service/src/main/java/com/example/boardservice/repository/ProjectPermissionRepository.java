package com.example.boardservice.repository;

import com.example.boardservice.dto.models.ProjectPermission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectPermissionRepository extends JpaRepository<ProjectPermission, Long> {
}
