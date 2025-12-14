package com.example.issueservice.services;

import com.example.issueservice.dto.models.Issue;
import com.example.issueservice.dto.models.Attachment;
import com.example.issueservice.dto.response.AttachmentResponse;
import com.example.issueservice.dto.response.UserPermissionsResponse;
import com.example.issueservice.dto.models.enums.ActionType;
import com.example.issueservice.dto.models.enums.EntityType;
import com.example.issueservice.exception.*;
import com.example.issueservice.repositories.AttachmentRepository;
import com.example.issueservice.repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final IssueRepository issueRepository;
    private final AuthService authService;

    @Transactional
    public AttachmentResponse uploadAttachment(Long userId, Long issueId, MultipartFile file) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IssueNotFoundException("Issue not found"));

        log.info("Uploading file to issue {} by user {}", issueId, userId);

        boolean isAssignedAuthor =
                Objects.equals(issue.getAssigneeId(), userId) ||
                Objects.equals(issue.getCreatorId(), userId) ||
                Objects.equals(issue.getCodeReviewerId(), userId) ||
                Objects.equals(issue.getQaEngineerId(), userId);

        if (!isAssignedAuthor) {
            UserPermissionsResponse permissions = authService.getUserPermissions(userId, issue.getProjectId());

            if (!permissions.isOwner()) {
                throw new AccessDeniedException(
                        String.format("User %d cannot upload file to issue %d: not author and not project owner",
                                userId, issueId)
                );
            }

            log.info("User {} is project owner, granting permission to upload file to issue {}", userId, issueId);
        } else {
            authService.hasPermission(userId, issue.getProjectId(), EntityType.ATTACHMENT, ActionType.CREATE);
            log.info("User {} is assigned for issue {}, upload permitted", userId, issueId);
        }

        try {
            Attachment attachment = Attachment.builder()
                    .issue(issue)
                    .fileName(file.getOriginalFilename())
                    .fileData(file.getBytes())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .createdBy(userId)
                    .build();

            attachment = attachmentRepository.save(attachment);
            log.info("User {} uploaded attachment {} to issue {}", userId, attachment.getId(), issueId);

            return AttachmentResponse.from(attachment);
        } catch (IOException e) {
            log.error("Failed to read file", e);
            throw new FileUploadException("Failed to read uploaded file");
        }
    }

    @Transactional(readOnly = true)
    public byte[] downloadAttachment(Long userId, Long attachmentId) {

        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new AttachmentNotFoundException("Attachment not found"));

        log.info("Downloading file by user {}", userId);

        Long projectId = attachment.getIssue().getProjectId();

        authService.hasPermission(userId, projectId, EntityType.ISSUE, ActionType.VIEW);

        log.info("User {} downloaded attachment {}", userId, attachmentId);
        return attachment.getFileData();
    }

    @Transactional
    public void deleteAttachment(Long userId, Long attachmentId) {

        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new AttachmentNotFoundException("Attachment not found"));

        log.info("Delete file by user {}", userId);

        Long projectId = attachment.getIssue().getProjectId();
        boolean isAuthor = attachment.getCreatedBy().equals(userId);

        if (!isAuthor) {
            authService.hasPermission(userId, projectId, EntityType.ATTACHMENT, ActionType.DELETE);
        } else {
            authService.hasPermission(userId, projectId, EntityType.ATTACHMENT, ActionType.DELETE_OWN);
        }

        attachmentRepository.delete(attachment);
        log.info("User {} deleted attachment {}", userId, attachmentId);
    }
}