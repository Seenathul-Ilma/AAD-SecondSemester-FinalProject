package lk.ijse.gdse71.smartclassroombackend.service;

import lk.ijse.gdse71.smartclassroombackend.dto.AssignmentDTO;
import lk.ijse.gdse71.smartclassroombackend.dto.ResourceDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

public interface AssignmentService {

    String generateNextAssignmentId();

    //String saveFile(MultipartFile file, String classroomId, String userId, String assignmentId, String assignmentCategory) throws IOException;

    List<String> saveFiles(List<MultipartFile> files, String classroomId, String userId, String assignmentId, String assignmentCategory) throws IOException;

    //AssignmentDTO createAssignmentByClassroomId(String classroomId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException;
    AssignmentDTO createAssignmentByClassroomId(String classroomId, String userId, String content, List<MultipartFile> file, LocalDateTime dueDate) throws IOException;

    //AssignmentDTO updateAssignmentByAssignmentId(String assignmentId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException;
    Boolean updateAssignmentByAssignmentId(String assignmentId, String userId, String title, String content, MultipartFile file, LocalDateTime dueDate) throws IOException;

    boolean deleteAssignment(String assignmentId, String deletingUserId);

    Page<AssignmentDTO> getAssignmentsByClassroomId(String classroomId, int page, int size);

    Page<AssignmentDTO> getAllAssignments(int page, int size);
}
