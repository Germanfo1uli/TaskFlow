package repositories;

import models.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    // Найти все вложения, прикрепленные к задаче
    List<Attachment> findByIssueId(Long issueId);

    // Найти все вложения, прикрепленные к комментарию
    List<Attachment> findByCommentId(Long commentId);
}
