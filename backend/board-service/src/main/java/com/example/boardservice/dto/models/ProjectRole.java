package com.example.boardservice.dto.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_roles", schema = "board_service_schema")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "role_permissions",
            schema = "board_service_schema",
            joinColumns = @JoinColumn(name = "role_id")
    )
    private Set<PermissionEntry> permissions = new HashSet<>();

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "is_owner")
    private Boolean isOwner = false;
}
