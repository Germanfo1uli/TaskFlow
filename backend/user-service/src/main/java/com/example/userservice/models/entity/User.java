package com.example.userservice.models.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", schema = "user_service_schema",
        uniqueConstraints = @UniqueConstraint(columnNames = {"username", "tag"}))
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "tag", nullable = false, length = 4)
    private String tag;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "bio", nullable = true)
    private String bio;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "system_role", nullable = false)
    @Enumerated(EnumType.STRING)
    private SystemRole systemRole = SystemRole.USER;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Avatar avatar;
}