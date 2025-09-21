package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Classroom;
import lk.ijse.gdse71.smartclassroombackend.entity.User;
import lk.ijse.gdse71.smartclassroombackend.entity.UserClassroom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

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
public interface UserClassroomRepository extends JpaRepository<UserClassroom, String> {

    @Query("SELECT uc FROM UserClassroom uc " +
            "JOIN FETCH uc.user u " +
            "JOIN FETCH uc.classroom c " +
            "WHERE uc.classroom.classroomId = :classroomId " +
            "ORDER BY uc.joinedAt DESC")
    Page<UserClassroom> findUsersInClassroomPaginated(@Param("classroomId") String classroomId,
                                                      Pageable pageable);

    UserClassroom findTopByOrderByUserClassroomIdDesc();

    boolean existsByUser_UserIdAndClassroom_ClassroomIdAndIsCreatorTrue(String updatingTeacherId, String classroomId);

    boolean existsByUserAndClassroom(User student, Classroom classroom);

    boolean existsByUser_UserIdAndClassroom_ClassroomId(String userId, String classroomId);

    void deleteByUser_UserIdAndClassroom_ClassroomId(String userId, String classroomId);

    void deleteByUser_UserIdAndClassroom_ClassroomCode(String userId, String classroomCode);

    Optional<UserClassroom> findByClassroom_ClassroomIdAndIsCreatorTrue(String classroomId);

    Page<UserClassroom> findByUser_UserId(String userId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM UserClassroom uc " +
            "WHERE uc.user.userId IN :memberIds AND uc.classroom.classroomId = :classroomId")
    void deleteByUserIdsAndClassroomId(@Param("memberIds") Set<String> memberIds,
                                       @Param("classroomId") String classroomId);
}
