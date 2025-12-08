package com.example.boardservice.dto.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "avatars", schema = "user_service_schema")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProjectAvatar {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "project_id")
    private Project project;

    @Lob
    @Column(name = "data", nullable = false)
    @JdbcTypeCode(SqlTypes.VARBINARY)
    private byte[] data;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "file_size", nullable = false)
    private Integer fileSize;

    @Column(name = "filename", nullable = false, unique = true)
    private String filename;
}