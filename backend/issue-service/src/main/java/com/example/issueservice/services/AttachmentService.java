package services;

import dto.response.AttachmentDto;
import exception.IssueNotFoundException;
import models.Attachment;
import models.IssueComment;
import models.Issue;
import repositories.AttachmentRepository;
import repositories.IssueCommentRepository;
import repositories.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final IssueRepository issueRepository;
    private final IssueCommentRepository commentRepository;

    @Transactional
    public AttachmentDto addAttachmentToIssue(Long issueId, String originalFileName, String filePath) {
        log.info("Adding attachment '{}' to issue {}", originalFileName, issueId);
        if (!issueRepository.existsById(issueId)) {
            throw new IssueNotFoundException("Issue with id " + issueId + " not found");
        }
        Attachment attachment = Attachment.builder()
                .issue(Issue.builder().id(issueId).build())
                .name(originalFileName)
                .path(filePath)
                .build();
        Attachment savedAttachment = attachmentRepository.save(attachment);
        log.info("Successfully saved attachment with id: {}", savedAttachment.getId());
        return convertToDto(savedAttachment);
    }

    @Transactional
    public AttachmentDto addAttachmentToComment(Long commentId, String originalFileName, String filePath) {
        log.info("Adding attachment '{}' to comment {}", originalFileName, commentId);
        IssueComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment with id " + commentId + " not found"));

        Attachment attachment = Attachment.builder()
                .comment(comment)
                .name(originalFileName)
                .path(filePath)
                .build();
        Attachment savedAttachment = attachmentRepository.save(attachment);
        log.info("Successfully saved attachment with id: {}", savedAttachment.getId());
        return convertToDto(savedAttachment);
    }

    public List<AttachmentDto> getAttachmentsByIssueId(Long issueId) {
        log.info("Fetching attachments for issue: {}", issueId);
        List<Attachment> attachments = attachmentRepository.findByIssueId(issueId);
        return attachments.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteAttachment(Long attachmentId, Long requestingUserId) {
        log.info("User {} is trying to delete attachment {}", requestingUserId, attachmentId);
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment with id " + attachmentId + " not found"));

        // TODO: Добавить проверку прав. Удалять может только автор задачи/комментария или админ.
        attachmentRepository.delete(attachment);
        log.info("Successfully deleted attachment {}", attachmentId);
    }

    private AttachmentDto convertToDto(Attachment attachment) {
        return AttachmentDto.builder()
                .id(attachment.getId())
                .name(attachment.getName())
                .path(attachment.getPath())
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}