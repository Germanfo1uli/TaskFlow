package com.example.userservice.models.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "avatars", schema = "user_service_schema")
@Data
public class Avatar {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Lob
    @Column(name = "data", nullable = false)
    @JdbcTypeCode(SqlTypes.VARBINARY)
    private byte[] data;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "file_size", nullable = false)
    private Integer fileSize;

    @Column(name = "filename", nullable = false)
    private String filename;
}