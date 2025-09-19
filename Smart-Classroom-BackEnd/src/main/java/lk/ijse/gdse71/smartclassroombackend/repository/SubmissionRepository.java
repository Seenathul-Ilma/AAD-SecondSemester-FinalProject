package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Assignment;
import lk.ijse.gdse71.smartclassroombackend.entity.Submission;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {

    // Check if a submission exists for a given user and assignment
    boolean existsByUserAndAssignment(User user, Assignment assignment);

    // Optional: fetch existing submission
    Optional<Submission> findByUserAndAssignment(User user, Assignment assignment);

}