package com.example.issueservice.dto.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_tags", schema = "issue_service_schema")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProjectTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @ManyToMany(mappedBy = "tags")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @ToString.Exclude
    @Builder.Default
    private Set<Issue> issues = new HashSet<>();

    @Column(nullable = false)
    private String name;
}
