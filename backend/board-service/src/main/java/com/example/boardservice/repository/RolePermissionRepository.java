package com.example.boardservice.repository;

import com.example.boardservice.dto.models.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> { }
