package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.UserClassroomDTO;

import java.util.List;
import java.util.Set;

public interface UserClassroomService {

    String generateNextClassroomId(String prefix);

    UserClassroomDTO joinClassroomByCode(String studentId, String classroomCode);

    List<UserClassroomDTO> joinListOfMembersToClassroomByCode(Set<String> studentIds, String classroomCode);

    List<UserClassroomDTO> joinListOfMembersToClassroomById(Set<String> studentIds, String classroomId);
    //boolean joinListOfMembersToClassroomById(Set<String> studentIds, String classroomId);

    void removeByUserClassroomId(String userClassroomId);

    void removeByUserAndClassroom(String userId, String classroomId);

    void removeByUserAndClassroomUsingClassroomCode(String userId, String classroomCode);

    void removeListOfByUserClassroomId(Set<String> userClassroomIds);

}
