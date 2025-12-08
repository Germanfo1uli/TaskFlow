package com.example.boardservice.repository;

import com.example.boardservice.dto.models.ProjectAvatar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectAvatarRepository extends JpaRepository<Long, ProjectAvatar> {
}
