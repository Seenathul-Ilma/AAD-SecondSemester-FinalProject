package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.AssignmentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentCommentRepository extends JpaRepository<AssignmentComment, Long> {

    List<AssignmentComment> findByAssignment_AssignmentId(String announcementId);

}
