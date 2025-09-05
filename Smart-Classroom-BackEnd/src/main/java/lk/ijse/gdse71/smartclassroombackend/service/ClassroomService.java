package lk.ijse.gdse71.smartclassroombackend.service;

import jakarta.validation.Valid;
import lk.ijse.gdse71.smartclassroombackend.dto.ClassroomDTO;
import lk.ijse.gdse71.smartclassroombackend.entity.Role;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/23/2025 9:58 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

public interface ClassroomService {
    Page<ClassroomDTO> getClassroomsByPaginated(int page, int size);

    String generateNextClassroomId(String prefix);

    ClassroomDTO saveClassroom(@Valid ClassroomDTO classroomDTO, String creatingTeacherId);

    ClassroomDTO updateClassroom(@Valid ClassroomDTO classroomDTO, String updatingTeacherId);

    List<ClassroomDTO> getAllClassrooms();

    boolean deleteClassroom(String id, String deletingTeacherId);

    ClassroomDTO getClassroomById(String classroomId);

    ClassroomDTO getClassroomByCode(String classroomCode);

    Page<ClassroomDTO> getClassroomsByRole(String userId, Role role, int page, int size);
}
