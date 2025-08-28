package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Resources;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resources, String> {
    Resources findTopByOrderByResourceIdDesc();

    Page<Resources> findByClassroom_ClassroomId(String classroomId, Pageable pageable);
}
