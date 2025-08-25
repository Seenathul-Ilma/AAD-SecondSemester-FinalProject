package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.UserClassroomDTO;

import java.util.List;
import java.util.Set;

public interface UserClassroomService {

    String generateNextClassroomId(String prefix);

    UserClassroomDTO joinClassroomByCode(String studentId, String classroomCode);

    List<UserClassroomDTO> joinListStudentsToClassroomByCode(Set<String> studentIds, String classroomCode);
}
