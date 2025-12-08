package com.example.issueservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDto {
    private Long id;
    private String name;
    private String path;
    private LocalDateTime createdAt;
}