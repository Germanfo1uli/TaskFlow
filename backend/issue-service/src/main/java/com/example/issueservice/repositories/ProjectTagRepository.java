package repositories;

import models.ProjectTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectTagRepository extends JpaRepository<ProjectTag, Long> {

    // Найти все теги, доступные в проекте
    List<ProjectTag> findByProjectId(Long projectId);

    // Проверить, существует ли тег с таким именем в проекте
    Optional<ProjectTag> findByProjectIdAndName(Long projectId, String name);
}