package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, String> {

    Classroom findTopByOrderByClassroomIdDesc();
    boolean existsByClassroomCode(String code);

    Optional<Classroom> findByClassroomCode(String classroomCode);

    Optional<Classroom> findByClassroomId(String classroomId);
}
