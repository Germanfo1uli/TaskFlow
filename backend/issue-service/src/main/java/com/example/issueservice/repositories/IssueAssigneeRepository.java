package com.example.issueservice.repositories;

import com.example.issueservice.dto.models.IssueAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface IssueAssigneeRepository extends JpaRepository<IssueAssignee, Long> {

    // Найти всех исполнителей для задачи
    List<IssueAssignee> findByIssueId(Long issueId);

    // Найти все задачи, назначенные на пользователя
    List<IssueAssignee> findByUserId(Long userId);

    boolean existsByIssueIdAndUserId(Long issueId, Long userId);

    // Удалить конкретного исполнителя с задачи
    @Transactional
    void deleteByIssueIdAndUserId(Long issueId, Long userId);

    // Удалить всех исполнителей с задачи
    @Transactional
    void deleteByIssueId(Long issueId);
}
