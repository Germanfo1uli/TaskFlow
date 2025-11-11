package com.example.userservice.models;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", schema = "user_service_schema")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="email", nullable = false, unique = true)
    private String Email;

    @Column(name="password_hash", nullable = false)
    private String PasswordHash;

    @Column(name="created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime CreatedAt;
}
