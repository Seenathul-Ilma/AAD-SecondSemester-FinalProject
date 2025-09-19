package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {

    Assignment findTopByOrderByAssignmentIdDesc();

    Page<Assignment> findByClassroom_ClassroomId(String classroomId, Pageable pageable);

    Page<Assignment> findByClassroom_ClassroomIdOrderByAssignedDateDesc(String classroomId, Pageable pageable);
}
