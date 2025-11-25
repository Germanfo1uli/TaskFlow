package com.example.userservice.repository;

import com.example.userservice.models.dto.data.UserFlags;
import com.example.userservice.models.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    @Query("SELECT u.lockedAt, u.deletedAt FROM User u WHERE u.id = :id")
    Optional<UserFlags> findFlagsById(@Param("id") Long id);
    boolean existsByUsernameAndTag(String username, String tag);
}
