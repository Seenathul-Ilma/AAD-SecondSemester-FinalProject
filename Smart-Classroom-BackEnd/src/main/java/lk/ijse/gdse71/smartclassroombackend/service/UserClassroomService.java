package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.UserClassroomDTO;

public interface UserClassroomService {

    String generateNextClassroomId(String prefix);

    UserClassroomDTO joinClassroomByCode(String studentId, String classroomCode);
}
