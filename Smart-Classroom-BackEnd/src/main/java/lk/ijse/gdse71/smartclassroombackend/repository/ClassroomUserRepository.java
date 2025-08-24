package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.UserClassroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/24/2025 8:56 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Repository
public interface ClassroomUserRepository extends JpaRepository<UserClassroom, String> {
    UserClassroom findTopByOrderByUserClassroomIdDesc();
    boolean existsByUser_UserIdAndClassroom_ClassroomIdAndIsCreatorTrue(String updatingTeacherId, String classroomId);
}
