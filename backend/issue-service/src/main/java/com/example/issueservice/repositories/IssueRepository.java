package repositories;

import models.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    // Найти все задачи в проекте
    List<Issue> findByProjectId(Long projectId);

    // Найти все дочерние задачи для родительской
    List<Issue> findByParentIssueId(Long parentIssueId);

    // Найти все задачи, созданные конкретным пользователем
    List<Issue> findByCreatorId(Long creatorId);

    // Найти все задачи с определенным статусом в проекте
    List<Issue> findByProjectIdAndStatus(Long projectId, Issue.IssueStatus status);
}