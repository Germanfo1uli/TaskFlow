package com.example.boardservice.dto.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "projects", schema = "board_service_schema")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "key", nullable = false)
    private String key;

    @Column(name = "invite_token", unique = true)
    private String inviteToken;
}
