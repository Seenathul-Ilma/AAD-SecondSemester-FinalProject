package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.AssignmentDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

public interface AssignmentService {

    String generateNextAssignmentId();

    String saveFile(MultipartFile file, String classroomId, String userId, String assignmentId, String assignmentCategory) throws IOException;

    AssignmentDTO createAssignmentByClassroomId(String classroomId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException;

    AssignmentDTO updateAssignmentByAssignmentId(String assignmentId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException;

    boolean deleteAssignment(String assignmentId, String deletingUserId);
}
