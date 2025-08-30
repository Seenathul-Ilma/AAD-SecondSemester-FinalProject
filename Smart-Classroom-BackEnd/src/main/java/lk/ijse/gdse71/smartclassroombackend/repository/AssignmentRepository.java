package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {

    Assignment findTopByOrderByAssignmentIdDesc();
}
