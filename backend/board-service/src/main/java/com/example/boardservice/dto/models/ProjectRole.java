package com.example.boardservice.dto.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_roles", schema = "board_service_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class ProjectRole {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "role_seq")
    @SequenceGenerator(name = "role_seq", sequenceName = "project_roles_id_seq", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "name", nullable = false)
    private String name;

    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    private Set<RolePermission> permissions = new HashSet<>();

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "is_owner")
    private Boolean isOwner = false;
}
