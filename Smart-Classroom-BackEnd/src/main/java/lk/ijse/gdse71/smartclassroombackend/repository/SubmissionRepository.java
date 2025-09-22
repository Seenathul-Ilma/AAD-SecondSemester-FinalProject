package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Assignment;
import lk.ijse.gdse71.smartclassroombackend.entity.AssignmentStatus;
import lk.ijse.gdse71.smartclassroombackend.entity.Submission;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {

    // Check if a submission exists for a given user and assignment
    boolean existsByUserAndAssignment(User user, Assignment assignment);

    // Optional: fetch existing submission
    Optional<Submission> findByUserAndAssignment(User user, Assignment assignment);

    Optional<Submission> findByUserUserIdAndAssignmentAssignmentId(String userId, String assignmentId);

    //Page<Submission> findByAssignment_AssignmentIdOrderByAssignedDateDesc(String assignmentId, Pageable pageable);
    Page<Submission> findByAssignment_AssignmentIdAndStatusOrderBySubmissionDateDesc(
            String assignmentId,
            AssignmentStatus status,
            Pageable pageable
    );

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.assignment.assignmentId = :assignmentId AND s.status = :status")
    long countByStatus(@Param("assignmentId") String assignmentId,
                       @Param("status") AssignmentStatus status);

}