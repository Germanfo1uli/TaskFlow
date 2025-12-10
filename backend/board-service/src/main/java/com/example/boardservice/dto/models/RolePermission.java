package com.example.boardservice.dto.models;

import com.example.boardservice.dto.models.enums.ActionType;
import com.example.boardservice.dto.models.enums.EntityType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role_permissions", schema = "board_service_schema")
@Getter
@Setter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "role")
public class RolePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "perm_seq")
    @SequenceGenerator(name = "perm_seq", sequenceName = "role_permission_id_seq", allocationSize = 50)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private ProjectRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    @EqualsAndHashCode.Include
    private EntityType entity;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    @EqualsAndHashCode.Include
    private ActionType action;
}