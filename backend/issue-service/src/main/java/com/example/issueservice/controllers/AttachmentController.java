package com.example.issueservice.controllers;

import com.example.issueservice.dto.models.Attachment;
import com.example.issueservice.dto.response.AttachmentResponse;
import com.example.issueservice.repositories.AttachmentRepository;
import com.example.issueservice.security.JwtUser;
import com.example.issueservice.services.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/issues/{issueId}/attachments")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Attachments Management", description = "Управление файлами в задачах")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final AttachmentRepository attachmentRepository;

    @Operation(
            summary = "Загрузка файла",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponse> upload(
            @PathVariable Long issueId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal JwtUser principal) {

        AttachmentResponse response = attachmentService.uploadAttachment(principal.userId(), issueId, file);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Скачивание файла",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/{attachmentId}")
    public ResponseEntity<byte[]> download(
            @PathVariable Long issueId,
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal JwtUser principal) {

        byte[] fileData = attachmentService.downloadAttachment(principal.userId(), attachmentId);
        Attachment attachment = attachmentRepository.findById(attachmentId).orElseThrow();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .contentLength(attachment.getFileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"%s\"".formatted(attachment.getFileName()))
                .body(fileData);
    }

    @Operation(
            summary = "Удаление файла",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long issueId,
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal JwtUser principal) {

        attachmentService.deleteAttachment(principal.userId(), attachmentId);
        return ResponseEntity.noContent().build();
    }
}